import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from "../src/storage/settingsStorage.ts";
import { loadCities, saveCities } from "../src/storage/citiesStorage.ts";
import { bogota, madrid } from "./helpers/fixtures.ts";
import { enterTempDir, exitTempDir } from "./helpers/tempDir.ts";

beforeAll(() => {
  enterTempDir();
  if (existsSync("cities.json") || existsSync("settings.json")) {
    throw new Error(
      "El directorio temporal no está vacío: los tests de storage correrían sobre datos reales.",
    );
  }
});

afterAll(() => {
  exitTempDir();
});

describe("loadCities", () => {
  it("crea cities.json con una lista vacía cuando no existe", async () => {
    rmSync("cities.json", { force: true });
    await expect(loadCities()).resolves.toEqual([]);
    expect(readFileSync("cities.json", "utf8")).toBe("[]");
  });

  it("devuelve las ciudades guardadas", async () => {
    writeFileSync("cities.json", JSON.stringify([madrid, bogota]));
    await expect(loadCities()).resolves.toEqual([madrid, bogota]);
  });

  it("lanza cuando el JSON es inválido", async () => {
    writeFileSync("cities.json", "{no es json");
    await expect(loadCities()).rejects.toThrow(
      "cities.json no es válido; se reiniciará con una lista vacía.",
    );
  });

  it("lanza cuando el contenido no es un array", async () => {
    writeFileSync("cities.json", '{"unit":"celsius"}');
    await expect(loadCities()).rejects.toThrow(
      "cities.json no es válido; se reiniciará con una lista vacía.",
    );
  });
});

describe("saveCities", () => {
  it("escribe JSON formateado y loadCities lo recupera", async () => {
    await saveCities([madrid]);
    expect(readFileSync("cities.json", "utf8")).toBe(JSON.stringify([madrid], null, 2));
    await expect(loadCities()).resolves.toEqual([madrid]);
  });
});

describe("DEFAULT_SETTINGS", () => {
  it("es celsius sin ciudad default", () => {
    expect(DEFAULT_SETTINGS).toEqual({ unit: "celsius", defaultCityId: null });
  });
});

describe("loadSettings", () => {
  it("crea settings.json con los valores por defecto cuando no existe", async () => {
    rmSync("settings.json", { force: true });
    const settings = await loadSettings();
    expect(settings).toEqual({ unit: "celsius", defaultCityId: null });
    expect(settings).toEqual(DEFAULT_SETTINGS);
    expect(readFileSync("settings.json", "utf8")).toBe(JSON.stringify(DEFAULT_SETTINGS, null, 2));
  });

  it("devuelve los valores guardados", async () => {
    writeFileSync("settings.json", JSON.stringify({ unit: "fahrenheit", defaultCityId: bogota.id }));
    await expect(loadSettings()).resolves.toEqual({ unit: "fahrenheit", defaultCityId: bogota.id });
  });

  it("normaliza una unidad desconocida a celsius", async () => {
    writeFileSync("settings.json", JSON.stringify({ unit: "kelvin", defaultCityId: "x" }));
    await expect(loadSettings()).resolves.toEqual({ unit: "celsius", defaultCityId: "x" });
  });

  it("completa defaultCityId con null cuando falta", async () => {
    writeFileSync("settings.json", JSON.stringify({ unit: "fahrenheit" }));
    await expect(loadSettings()).resolves.toEqual({ unit: "fahrenheit", defaultCityId: null });
  });

  it("lanza cuando el JSON es inválido", async () => {
    writeFileSync("settings.json", "no es json");
    await expect(loadSettings()).rejects.toThrow(
      "settings.json no es válido; se reiniciará con la configuración por defecto.",
    );
  });
});

describe("saveSettings", () => {
  it("escribe JSON formateado y loadSettings lo recupera", async () => {
    const settings = { unit: "fahrenheit" as const, defaultCityId: bogota.id };
    await saveSettings(settings);
    expect(readFileSync("settings.json", "utf8")).toBe(JSON.stringify(settings, null, 2));
    await expect(loadSettings()).resolves.toEqual(settings);
  });
});
