import { afterEach, describe, expect, it, mock } from "bun:test";
import { geocode } from "../src/api/geocoding.ts";
import { safeFetchJson } from "../src/api/http.ts";
import { getForecast, getWeather } from "../src/api/weather.ts";
import { bogota, madrid } from "./helpers/fixtures.ts";

const realFetch = globalThis.fetch;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

function useFetch(impl: (url: string) => Promise<Response>) {
  const fetchMock = mock(impl);
  globalThis.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

afterEach(() => {
  globalThis.fetch = realFetch;
});

describe("safeFetchJson", () => {
  it("devuelve el JSON parseado cuando la respuesta es correcta", async () => {
    const fetchMock = useFetch(async () => jsonResponse({ results: 7 }));
    const data = await safeFetchJson("https://ejemplo.com/api");
    expect(data).toEqual({ results: 7 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://ejemplo.com/api");
  });

  it("lanza el código de estado cuando la respuesta no es ok", async () => {
    useFetch(async () => new Response("error", { status: 503 }));
    await expect(safeFetchJson("https://ejemplo.com/api")).rejects.toThrow(
      "La API respondió con código 503.",
    );
  });

  it("lanza el mensaje de conexión cuando fetch falla", async () => {
    useFetch(async () => {
      throw new Error("ECONNREFUSED");
    });
    await expect(safeFetchJson("https://ejemplo.com/api")).rejects.toThrow(
      "Error de conexión. Revisa tu internet e intenta de nuevo.",
    );
  });
});

describe("geocode", () => {
  it("construye la URL correcta y mapea el resultado a City", async () => {
    const fetchMock = useFetch(async () =>
      jsonResponse({
        results: [{ name: "Nueva York", country: "Estados Unidos", latitude: 40.7128, longitude: -74.006 }],
      }),
    );
    const city = await geocode("Nueva York");
    expect(city).toEqual({
      id: expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/),
      name: "Nueva York",
      country: "Estados Unidos",
      latitude: 40.7128,
      longitude: -74.006,
    });
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "https://geocoding-api.open-meteo.com/v1/search?name=Nueva%20York&count=1&language=es&format=json",
    );
  });

  it("devuelve null cuando no hay resultados", async () => {
    useFetch(async () => jsonResponse({ results: [] }));
    await expect(geocode("Atlantis")).resolves.toBeNull();
  });

  it("devuelve null cuando la respuesta no trae results", async () => {
    useFetch(async () => jsonResponse({ generationtime_ms: 0.5 }));
    await expect(geocode("Nada")).resolves.toBeNull();
  });

  it("usa cadena vacía como país cuando la API devuelve null", async () => {
    useFetch(async () =>
      jsonResponse({ results: [{ name: "Polo Norte", country: null, latitude: 90, longitude: 0 }] }),
    );
    await expect(geocode("Polo Norte")).resolves.toMatchObject({ country: "" });
  });
});

describe("getWeather", () => {
  it("devuelve la temperatura y construye la URL correcta", async () => {
    const fetchMock = useFetch(async () => jsonResponse({ current: { temperature_2m: 21.56 } }));
    await expect(getWeather(madrid, "celsius")).resolves.toBe(21.56);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "https://api.open-meteo.com/v1/forecast?latitude=40.4165&longitude=-3.70256&current=temperature_2m&temperature_unit=celsius",
    );
  });

  it("pasa la unidad seleccionada a la URL", async () => {
    const fetchMock = useFetch(async () => jsonResponse({ current: { temperature_2m: 89 } }));
    await expect(getWeather(madrid, "fahrenheit")).resolves.toBe(89);
    expect(fetchMock.mock.calls[0]?.[0]).toContain("temperature_unit=fahrenheit");
  });

  it("lanza cuando la respuesta no trae temperatura", async () => {
    useFetch(async () => jsonResponse({ current: {} }));
    await expect(getWeather(madrid, "celsius")).rejects.toThrow(
      "La API no devolvió temperatura para esta ciudad.",
    );
  });

  it("lanza cuando la temperatura no es un número", async () => {
    useFetch(async () => jsonResponse({ current: { temperature_2m: "21" } }));
    await expect(getWeather(madrid, "celsius")).rejects.toThrow(
      "La API no devolvió temperatura para esta ciudad.",
    );
  });
});

describe("getForecast", () => {
  it("construye la URL correcta y entrelaza los arrays paralelos", async () => {
    const fetchMock = useFetch(async () =>
      jsonResponse({
        daily: {
          time: ["2026-09-04", "2026-09-05", "2026-09-06"],
          weather_code: [0, 61, 95],
          temperature_2m_max: [28, 24.5, 20],
          temperature_2m_min: [16, 14, 12],
          precipitation_probability_max: [5, null, 80],
        },
      }),
    );
    await expect(getForecast(bogota, "fahrenheit")).resolves.toEqual([
      { date: "2026-09-04", tempMax: 28, tempMin: 16, weatherCode: 0, rainProbability: 5 },
      { date: "2026-09-05", tempMax: 24.5, tempMin: 14, weatherCode: 61, rainProbability: null },
      { date: "2026-09-06", tempMax: 20, tempMin: 12, weatherCode: 95, rainProbability: 80 },
    ]);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "https://api.open-meteo.com/v1/forecast?latitude=4.60971&longitude=-74.08175&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=7&timezone=auto&temperature_unit=fahrenheit",
    );
  });

  it("se salta los días con campos incompletos", async () => {
    useFetch(async () =>
      jsonResponse({
        daily: {
          time: ["2026-09-04", "2026-09-05", "2026-09-06", "2026-09-07"],
          weather_code: [0, 61, 95, 3],
          temperature_2m_max: [28, 24.5, 20],
          temperature_2m_min: [16, 14, 12],
        },
      }),
    );
    const forecast = await getForecast(madrid, "celsius");
    expect(forecast).toHaveLength(3);
    expect(forecast.map((day) => day.date)).toEqual(["2026-09-04", "2026-09-05", "2026-09-06"]);
    for (const day of forecast) {
      expect(day.rainProbability).toBeNull();
    }
  });

  it("lanza cuando no hay ningún día válido", async () => {
    useFetch(async () => jsonResponse({ daily: {} }));
    await expect(getForecast(madrid, "celsius")).rejects.toThrow(
      "La API no devolvió previsión para esta ciudad.",
    );
  });

  it("lanza cuando la respuesta no trae daily", async () => {
    useFetch(async () => jsonResponse({}));
    await expect(getForecast(madrid, "celsius")).rejects.toThrow(
      "La API no devolvió previsión para esta ciudad.",
    );
  });
});
