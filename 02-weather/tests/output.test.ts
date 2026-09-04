import { describe, expect, it } from "bun:test";
import {
  printCities,
  printCurrentWeather,
  printError,
  printForecast,
  printNoCities,
  printNoDefaultCity,
} from "../src/presentation/output.ts";
import { captureLog } from "./helpers/consoleCapture.ts";
import { bogota, forecastDays, madrid } from "./helpers/fixtures.ts";

describe("printCities", () => {
  it("numera las ciudades y marca la default", () => {
    const lines = captureLog(() => printCities([madrid, bogota], madrid.id));
    expect(lines).toEqual(["  1. Madrid, España (default)", "  2. Bogotá, Colombia"]);
  });

  it("no marca ninguna ciudad sin default", () => {
    const lines = captureLog(() => printCities([madrid, bogota], null));
    expect(lines).toEqual(["  1. Madrid, España", "  2. Bogotá, Colombia"]);
  });
});

describe("printCurrentWeather", () => {
  it("muestra ciudad, temperatura con un decimal y unidad", () => {
    const lines = captureLog(() => printCurrentWeather(madrid, 21.56, "celsius"));
    expect(lines).toEqual(["\n  Clima actual en Madrid, España: 21.6 °C\n"]);
  });

  it("muestra la unidad en fahrenheit", () => {
    const lines = captureLog(() => printCurrentWeather(bogota, 89, "fahrenheit"));
    expect(lines).toEqual(["\n  Clima actual en Bogotá, Colombia: 89.0 °F\n"]);
  });
});

describe("printForecast", () => {
  it("imprime la cabecera de la ciudad y una fila por día", () => {
    const lines = captureLog(() => printForecast(madrid, forecastDays));
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe("\n  Madrid, España");
    expect(lines[1]).toBe(
      `   Vie 04   ${"Despejado"}${" ".repeat(18)}${"28.0° / 16.0°"}${" ".repeat(2)}   Lluvia:   5%`,
    );
    expect(lines[2]).toContain("Sáb 05");
    expect(lines[2]).toContain("Lluvia ligera");
    expect(lines[2]).toContain("n/d");
  });
});

describe("printError", () => {
  it("muestra el mensaje de un Error", () => {
    const lines = captureLog(() => printError(new Error("La API falló")));
    expect(lines).toEqual(["\n  La API falló\n"]);
  });

  it("muestra Error desconocido. para valores que no son Error", () => {
    expect(captureLog(() => printError("texto suelto"))).toEqual(["\n  Error desconocido.\n"]);
    expect(captureLog(() => printError({ raro: true }))).toEqual(["\n  Error desconocido.\n"]);
  });
});

describe("printNoCities", () => {
  it("muestra el mensaje de lista vacía", () => {
    expect(captureLog(() => printNoCities())).toEqual([
      "\n  No hay ciudades guardadas. Agrega una con la opción 3.\n",
    ]);
  });
});

describe("printNoDefaultCity", () => {
  it("muestra el mensaje sin ciudad default", () => {
    expect(captureLog(() => printNoDefaultCity())).toEqual([
      "\n  No hay ciudad default. Agrega una con la opción 3 y establécela con la 5.\n",
    ]);
  });
});
