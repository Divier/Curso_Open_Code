import type { City } from "../../src/types/City.ts";
import type { Settings } from "../../src/types/Settings.ts";
import type { DailyForecast } from "../../src/types/Weather.ts";

export const madrid: City = {
  id: "11111111-1111-1111-1111-111111111111",
  name: "Madrid",
  country: "España",
  latitude: 40.4165,
  longitude: -3.70256,
};

export const bogota: City = {
  id: "22222222-2222-2222-2222-222222222222",
  name: "Bogotá",
  country: "Colombia",
  latitude: 4.60971,
  longitude: -74.08175,
};

export const ottawa: City = {
  id: "33333333-3333-3333-3333-333333333333",
  name: "Ottawa",
  country: "Canadá",
  latitude: 45.41117,
  longitude: -75.69812,
};

export const defaultSettings: Settings = { unit: "celsius", defaultCityId: null };

export const forecastDays: DailyForecast[] = [
  { date: "2026-09-04", tempMax: 28, tempMin: 16, weatherCode: 0, rainProbability: 5 },
  { date: "2026-09-05", tempMax: 24.5, tempMin: 14, weatherCode: 61, rainProbability: null },
];

export function stripAnsi(text: string): string {
  return text.replace(/\x1b\[[0-9;]*m/g, "");
}
