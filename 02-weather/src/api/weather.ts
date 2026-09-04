import type { City } from "../types/City.ts";
import type { DailyForecast, Unit } from "../types/Weather.ts";
import { safeFetchJson } from "./http.ts";

export async function getWeather(city: City, unit: Unit): Promise<number> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m&temperature_unit=${unit}`;
  const data = (await safeFetchJson(url)) as { current?: { temperature_2m?: number } };
  const temp = data.current?.temperature_2m;
  if (typeof temp !== "number") {
    throw new Error("La API no devolvió temperatura para esta ciudad.");
  }
  return temp;
}

export async function getForecast(city: City, unit: Unit): Promise<DailyForecast[]> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=7&timezone=auto&temperature_unit=${unit}`;
  const data = (await safeFetchJson(url)) as {
    daily?: {
      time?: string[];
      weather_code?: number[];
      temperature_2m_max?: number[];
      temperature_2m_min?: number[];
      precipitation_probability_max?: (number | null)[];
    };
  };
  const times = data.daily?.time ?? [];
  const codes = data.daily?.weather_code ?? [];
  const maxs = data.daily?.temperature_2m_max ?? [];
  const mins = data.daily?.temperature_2m_min ?? [];
  const rains = data.daily?.precipitation_probability_max ?? [];
  const forecast: DailyForecast[] = [];
  for (let i = 0; i < times.length; i++) {
    const date = times[i];
    const code = codes[i];
    const max = maxs[i];
    const min = mins[i];
    if (date === undefined || code === undefined || max === undefined || min === undefined) continue;
    forecast.push({
      date,
      tempMax: max,
      tempMin: min,
      weatherCode: code,
      rainProbability: rains[i] ?? null,
    });
  }
  if (forecast.length === 0) {
    throw new Error("La API no devolvió previsión para esta ciudad.");
  }
  return forecast;
}
