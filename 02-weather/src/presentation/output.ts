import type { City } from "../types/City.ts";
import type { DailyForecast, Unit } from "../types/Weather.ts";
import { bold, cyan, red, yellow } from "../utils/colors.ts";
import { dayLabel, unitSymbol } from "../utils/format.ts";
import { weatherCodeText } from "../utils/weather-codes.ts";

export function printError(err: unknown): void {
  const msg = err instanceof Error ? err.message : "Error desconocido.";
  console.log(red(`\n  ${msg}\n`));
}

export function printCities(cities: City[], defaultCityId: string | null): void {
  cities.forEach((city, i) => {
    const def = city.id === defaultCityId ? " (default)" : "";
    console.log(`  ${i + 1}. ${city.name}, ${city.country}${def}`);
  });
}

export function printCurrentWeather(city: City, temp: number, unit: Unit): void {
  console.log(`\n  Clima actual en ${city.name}, ${city.country}: ${yellow(`${temp.toFixed(1)} ${unitSymbol(unit)}`)}\n`);
}

export function printForecast(city: City, forecast: DailyForecast[]): void {
  console.log(`\n${cyan(bold(`  ${city.name}, ${city.country}`))}`);
  forecast.forEach((day) => {
    const temps = `${day.tempMax.toFixed(1)}° / ${day.tempMin.toFixed(1)}°`.padEnd(15);
    const rain = day.rainProbability === null ? "n/d" : `${String(day.rainProbability).padStart(3)}%`;
    console.log(`   ${dayLabel(day.date)}   ${weatherCodeText(day.weatherCode).padEnd(27)}${yellow(temps)}   Lluvia: ${rain}`);
  });
}

export function printNoCities(): void {
  console.log("\n  No hay ciudades guardadas. Agrega una con la opción 3.\n");
}

export function printNoDefaultCity(): void {
  console.log("\n  No hay ciudad default. Agrega una con la opción 3 y establécela con la 5.\n");
}
