import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, mock } from "bun:test";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import type { City } from "../src/types/City.ts";
import { captureLogAsync } from "./helpers/consoleCapture.ts";
import { bogota, madrid, ottawa } from "./helpers/fixtures.ts";
import { enterTempDir, exitTempDir } from "./helpers/tempDir.ts";

type AskStep = { reply: string } | { throw: Error };

class MockEndOfInputError extends Error {
  constructor() {
    super("End of input");
  }
}

let askQueue: AskStep[];
let askPrompts: string[];
let fetchCalls: string[];
let fetchImpl: (url: string) => Promise<Response>;

mock.module("../src/presentation/input.ts", () => ({
  EndOfInputError: MockEndOfInputError,
  ask: async (prompt: string): Promise<string> => {
    askPrompts.push(prompt);
    const step = askQueue.shift();
    if (step === undefined) throw new MockEndOfInputError();
    if ("throw" in step) throw step.throw;
    return step.reply;
  },
}));

const { listCities } = await import("../src/actions/listCities.ts");
const { allWeather, defaultWeather } = await import("../src/actions/getWeather.ts");
const { allForecasts } = await import("../src/actions/getForecast.ts");
const { addCity } = await import("../src/actions/addCity.ts");
const { setDefaultCity } = await import("../src/actions/setDefaultCity.ts");
const { removeCity } = await import("../src/actions/removeCity.ts");
const { updateSettings } = await import("../src/actions/settings.ts");
const { runMenu } = await import("../src/presentation/menu.ts");

const realFetch = globalThis.fetch;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

function reply(...values: string[]): AskStep[] {
  return values.map((value) => ({ reply: value }));
}

function readCitiesFile(): City[] {
  return JSON.parse(readFileSync("cities.json", "utf8")) as City[];
}

function readSettingsFile(): { unit: string; defaultCityId: string | null } {
  return JSON.parse(readFileSync("settings.json", "utf8")) as {
    unit: string;
    defaultCityId: string | null;
  };
}

beforeAll(() => {
  enterTempDir();
  if (existsSync("cities.json") || existsSync("settings.json")) {
    throw new Error(
      "El directorio temporal no está vacío: los tests correrían sobre datos reales.",
    );
  }
});

afterAll(() => {
  exitTempDir();
});

beforeEach(() => {
  askQueue = [];
  askPrompts = [];
  fetchCalls = [];
  fetchImpl = async () => jsonResponse({});
  writeFileSync("cities.json", "[]");
  writeFileSync("settings.json", JSON.stringify({ unit: "celsius", defaultCityId: null }));
  const fetchMock = mock((url: string) => {
    fetchCalls.push(url);
    return fetchImpl(url);
  });
  globalThis.fetch = fetchMock as unknown as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = realFetch;
});

describe("listCities", () => {
  it("muestra el mensaje de lista vacía cuando no hay ciudades", async () => {
    const lines = await captureLogAsync(() => listCities());
    expect(lines).toEqual(["\n  No hay ciudades guardadas. Agrega una con la opción 3.\n"]);
  });

  it("lista las ciudades numeradas y marca la default", async () => {
    writeFileSync("cities.json", JSON.stringify([madrid, bogota]));
    writeFileSync("settings.json", JSON.stringify({ unit: "celsius", defaultCityId: madrid.id }));
    const lines = await captureLogAsync(() => listCities());
    expect(lines).toEqual(["", "  1. Madrid, España (default)", "  2. Bogotá, Colombia", ""]);
  });
});

describe("defaultWeather", () => {
  it("muestra el mensaje sin ciudad default cuando no hay default", async () => {
    const lines = await captureLogAsync(() => defaultWeather());
    expect(lines).toEqual([
      "\n  No hay ciudad default. Agrega una con la opción 3 y establécela con la 5.\n",
    ]);
  });

  it("muestra el mensaje sin default cuando el id no existe en la lista", async () => {
    writeFileSync("cities.json", JSON.stringify([madrid]));
    writeFileSync("settings.json", JSON.stringify({ unit: "celsius", defaultCityId: "id-inexistente" }));
    const lines = await captureLogAsync(() => defaultWeather());
    expect(lines).toEqual([
      "\n  No hay ciudad default. Agrega una con la opción 3 y establécela con la 5.\n",
    ]);
  });

  it("consulta la API con la ciudad y unidad default e imprime el clima", async () => {
    writeFileSync("cities.json", JSON.stringify([madrid]));
    writeFileSync("settings.json", JSON.stringify({ unit: "celsius", defaultCityId: madrid.id }));
    fetchImpl = async () => jsonResponse({ current: { temperature_2m: 21.56 } });
    const lines = await captureLogAsync(() => defaultWeather());
    expect(lines).toEqual(["\n  Clima actual en Madrid, España: 21.6 °C\n"]);
    expect(fetchCalls[0]).toBe(
      "https://api.open-meteo.com/v1/forecast?latitude=40.4165&longitude=-3.70256&current=temperature_2m&temperature_unit=celsius",
    );
  });

  it("muestra el error de la API sin lanzarlo", async () => {
    writeFileSync("cities.json", JSON.stringify([madrid]));
    writeFileSync("settings.json", JSON.stringify({ unit: "celsius", defaultCityId: madrid.id }));
    fetchImpl = async () => new Response("error", { status: 500 });
    const lines = await captureLogAsync(() => defaultWeather());
    expect(lines).toEqual(["\n  La API respondió con código 500.\n"]);
  });
});

describe("allWeather", () => {
  it("muestra el mensaje de lista vacía cuando no hay ciudades", async () => {
    const lines = await captureLogAsync(() => allWeather());
    expect(lines).toEqual(["\n  No hay ciudades guardadas. Agrega una con la opción 3.\n"]);
  });

  it("imprime la temperatura de cada ciudad y su error de API por ciudad", async () => {
    writeFileSync("cities.json", JSON.stringify([madrid, bogota, ottawa]));
    fetchImpl = async (url) => {
      if (url.includes("latitude=40.4165")) return jsonResponse({ current: { temperature_2m: 18.34 } });
      if (url.includes("latitude=4.60971")) return new Response("error", { status: 503 });
      throw new Error("red caída");
    };
    const lines = await captureLogAsync(() => allWeather());
    expect(lines).toEqual([
      "",
      "  Madrid, España: 18.3 °C",
      "  Bogotá, Colombia: La API respondió con código 503.",
      "  Ottawa, Canadá: Error de conexión. Revisa tu internet e intenta de nuevo.",
      "",
    ]);
  });
});

describe("allForecasts", () => {
  it("muestra el mensaje de lista vacía cuando no hay ciudades", async () => {
    const lines = await captureLogAsync(() => allForecasts());
    expect(lines).toEqual(["\n  No hay ciudades guardadas. Agrega una con la opción 3.\n"]);
  });

  it("consulta la previsión de cada ciudad y la imprime", async () => {
    writeFileSync("cities.json", JSON.stringify([madrid]));
    fetchImpl = async () =>
      jsonResponse({
        daily: {
          time: ["2026-09-04", "2026-09-05"],
          weather_code: [0, 61],
          temperature_2m_max: [28, 24.5],
          temperature_2m_min: [16, 14],
          precipitation_probability_max: [5, null],
        },
      });
    const lines = await captureLogAsync(() => allForecasts());
    expect(lines).toHaveLength(6);
    expect(lines[0]).toBe("\n  Consultando previsión...\n");
    expect(lines[1]).toBe("\n  Previsión 7 días (°C)");
    expect(lines[2]).toBe("\n  Madrid, España");
    expect(lines[3]).toContain("Vie 04");
    expect(lines[4]).toContain("Sáb 05");
    expect(lines[5]).toBe("");
    expect(fetchCalls[0]).toContain("forecast_days=7");
    expect(fetchCalls[0]).toContain("timezone=auto");
  });

  it("imprime el error de la API por ciudad sin lanzarlo", async () => {
    writeFileSync("cities.json", JSON.stringify([madrid]));
    fetchImpl = async () => new Response("error", { status: 500 });
    const lines = await captureLogAsync(() => allForecasts());
    expect(lines).toEqual([
      "\n  Consultando previsión...\n",
      "\n  Previsión 7 días (°C)",
      "\n  Madrid, España: La API respondió con código 500.",
      "",
    ]);
  });
});

describe("addCity", () => {
  it("rechaza el nombre vacío sin llamar a la API", async () => {
    askQueue = reply("");
    const lines = await captureLogAsync(() => addCity());
    expect(lines).toEqual(["\n  El nombre no puede estar vacío.\n"]);
    expect(askPrompts[0]).toContain("Nombre de la ciudad");
    expect(fetchCalls).toEqual([]);
  });

  it("avisa cuando la ciudad no se encuentra", async () => {
    askQueue = reply("Atlantis");
    fetchImpl = async () => jsonResponse({ results: [] });
    const lines = await captureLogAsync(() => addCity());
    expect(lines).toEqual([`\n  No se encontró "Atlantis".\n`]);
    expect(fetchCalls[0]).toContain("name=Atlantis");
    expect(readCitiesFile()).toEqual([]);
  });

  it("geocodifica, guarda y confirma la ciudad nueva", async () => {
    askQueue = reply("Bogotá");
    writeFileSync("cities.json", JSON.stringify([madrid]));
    fetchImpl = async () =>
      jsonResponse({
        results: [{ name: "Bogotá", country: "Colombia", latitude: 4.60971, longitude: -74.08175 }],
      });
    const lines = await captureLogAsync(() => addCity());
    expect(lines).toEqual(["\n  Ciudad agregada: Bogotá, Colombia\n"]);
    expect(fetchCalls[0]).toContain("name=Bogot%C3%A1");
    expect(readCitiesFile()).toEqual([
      madrid,
      {
        id: expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/),
        name: "Bogotá",
        country: "Colombia",
        latitude: 4.60971,
        longitude: -74.08175,
      },
    ]);
  });

  it("rechaza duplicados ignorando mayúsculas y minúsculas", async () => {
    askQueue = reply("Madrid");
    writeFileSync("cities.json", JSON.stringify([{ ...madrid, name: "MADRID" }]));
    fetchImpl = async () =>
      jsonResponse({
        results: [{ name: "Madrid", country: "España", latitude: 40.4165, longitude: -3.70256 }],
      });
    const lines = await captureLogAsync(() => addCity());
    expect(lines).toEqual(["\n  Madrid, España ya está en tu lista.\n"]);
    expect(readCitiesFile()).toHaveLength(1);
  });

  it("muestra el error de conexión de la API sin lanzarlo", async () => {
    askQueue = reply("Madrid");
    fetchImpl = async () => {
      throw new Error("red caída");
    };
    const lines = await captureLogAsync(() => addCity());
    expect(lines).toEqual(["\n  Error de conexión. Revisa tu internet e intenta de nuevo.\n"]);
    expect(readCitiesFile()).toEqual([]);
  });
});

describe("setDefaultCity", () => {
  it("avisa cuando no hay ciudades sin pedir número", async () => {
    const lines = await captureLogAsync(() => setDefaultCity());
    expect(lines).toEqual(["\n  No hay ciudades. Agrega una con la opción 3.\n"]);
    expect(askPrompts).toEqual([]);
  });

  it("guarda la ciudad elegida como default", async () => {
    askQueue = reply("2");
    writeFileSync("cities.json", JSON.stringify([madrid, bogota]));
    const lines = await captureLogAsync(() => setDefaultCity());
    expect(lines).toEqual([
      "",
      "  1. Madrid, España",
      "  2. Bogotá, Colombia",
      "\n  Ciudad default: Bogotá, Colombia\n",
    ]);
    expect(readSettingsFile()).toEqual({ unit: "celsius", defaultCityId: bogota.id });
  });

  it("rechaza un número fuera de rango sin guardar", async () => {
    askQueue = reply("99");
    writeFileSync("cities.json", JSON.stringify([madrid, bogota]));
    const lines = await captureLogAsync(() => setDefaultCity());
    expect(lines).toContain("\n  Número no válido.\n");
    expect(readSettingsFile()).toEqual({ unit: "celsius", defaultCityId: null });
  });

  it("rechaza una entrada que no es un número sin guardar", async () => {
    askQueue = reply("abc");
    writeFileSync("cities.json", JSON.stringify([madrid, bogota]));
    const lines = await captureLogAsync(() => setDefaultCity());
    expect(lines).toContain("\n  Número no válido.\n");
    expect(readSettingsFile()).toEqual({ unit: "celsius", defaultCityId: null });
  });
});

describe("removeCity", () => {
  it("avisa cuando no hay ciudades que eliminar", async () => {
    const lines = await captureLogAsync(() => removeCity());
    expect(lines).toEqual(["\n  No hay ciudades para eliminar.\n"]);
  });

  it("elimina la ciudad elegida y guarda la lista", async () => {
    askQueue = reply("1");
    writeFileSync("cities.json", JSON.stringify([madrid, bogota]));
    const lines = await captureLogAsync(() => removeCity());
    expect(lines).toEqual([
      "",
      "  1. Madrid, España",
      "  2. Bogotá, Colombia",
      "\n  Ciudad eliminada: Madrid, España\n",
    ]);
    expect(readCitiesFile()).toEqual([bogota]);
  });

  it("limpia la ciudad default al eliminar esa ciudad", async () => {
    askQueue = reply("1");
    writeFileSync("cities.json", JSON.stringify([madrid, bogota]));
    writeFileSync("settings.json", JSON.stringify({ unit: "celsius", defaultCityId: madrid.id }));
    await captureLogAsync(() => removeCity());
    expect(readCitiesFile()).toEqual([bogota]);
    expect(readSettingsFile()).toEqual({ unit: "celsius", defaultCityId: null });
  });

  it("rechaza un número inválido sin modificar la lista", async () => {
    askQueue = reply("0");
    writeFileSync("cities.json", JSON.stringify([madrid, bogota]));
    const lines = await captureLogAsync(() => removeCity());
    expect(lines).toContain("\n  Número no válido.\n");
    expect(readCitiesFile()).toHaveLength(2);
  });
});

describe("updateSettings", () => {
  it("cambia la unidad y la guarda", async () => {
    askQueue = reply("2");
    const lines = await captureLogAsync(() => updateSettings());
    expect(lines).toEqual([
      "\n  Unidad actual: °C",
      "  1. Celsius (°C)",
      "  2. Fahrenheit (°F)\n",
      "\n  Unidad establecida: °F\n",
    ]);
    expect(readSettingsFile()).toEqual({ unit: "fahrenheit", defaultCityId: null });
  });

  it("no guarda cuando la unidad no cambia", async () => {
    askQueue = reply("1");
    const lines = await captureLogAsync(() => updateSettings());
    expect(lines).toContain("\n  Ya estás usando esa unidad.\n");
    expect(readSettingsFile()).toEqual({ unit: "celsius", defaultCityId: null });
  });

  it("rechaza una opción inválida sin guardar", async () => {
    askQueue = reply("5");
    const lines = await captureLogAsync(() => updateSettings());
    expect(lines).toContain("\n  Opción no válida.\n");
    expect(readSettingsFile()).toEqual({ unit: "celsius", defaultCityId: null });
  });
});

describe("runMenu", () => {
  it("imprime el menú, ejecuta la acción elegida y termina con la opción 9", async () => {
    askQueue = reply("7", "9");
    writeFileSync("cities.json", JSON.stringify([madrid, bogota]));
    const lines = await captureLogAsync(() => runMenu());
    expect(lines.filter((line) => line.includes("WEATHER CLI"))).toHaveLength(2);
    expect(lines.some((line) => line.includes("7. Listar ciudades guardadas"))).toBe(true);
    expect(lines.some((line) => line.includes("9. Salir"))).toBe(true);
    expect(lines.some((line) => line === "  1. Madrid, España")).toBe(true);
    expect(lines.some((line) => line === "  2. Bogotá, Colombia")).toBe(true);
  });

  it("avisa de opción no válida y sigue mostrando el menú", async () => {
    askQueue = reply("z", "9");
    const lines = await captureLogAsync(() => runMenu());
    expect(lines.some((line) => line === "\n  Opción no válida.\n")).toBe(true);
    expect(lines.filter((line) => line.includes("WEATHER CLI"))).toHaveLength(2);
  });

  it("captura los errores de las acciones y continúa el bucle", async () => {
    askQueue = [
      { reply: "3" },
      { throw: new Error("fallo simulado de entrada") },
      { reply: "9" },
    ];
    const lines = await captureLogAsync(() => runMenu());
    expect(lines.some((line) => line === "\n  fallo simulado de entrada\n")).toBe(true);
    expect(lines.filter((line) => line.includes("WEATHER CLI"))).toHaveLength(2);
    expect(askPrompts.some((prompt) => prompt.includes("Nombre de la ciudad"))).toBe(true);
  });

  it("propaga EndOfInputError cuando la entrada se cierra", async () => {
    askQueue = [];
    await expect(captureLogAsync(() => runMenu())).rejects.toThrow("End of input");
  });
});
