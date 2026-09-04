import type { City, Unit } from "./types.ts";

interface GeoResult {
  name: string;
  country: string | null;
  latitude: number;
  longitude: number;
}

async function safeFetchJson(url: string): Promise<unknown> {
  let res: Response;
  try {
    res = await fetch(url);
  } catch {
    throw new Error("Error de conexión. Revisa tu internet e intenta de nuevo.");
  }
  if (!res.ok) {
    throw new Error(`La API respondió con código ${res.status}.`);
  }
  return res.json();
}

export async function geocode(cityName: string): Promise<City | null> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=es&format=json`;
  const data = (await safeFetchJson(url)) as { results?: GeoResult[] };
  const first = data.results?.[0];
  if (!first) return null;
  return {
    id: crypto.randomUUID(),
    name: first.name,
    country: first.country ?? "",
    latitude: first.latitude,
    longitude: first.longitude,
  };
}

export async function getWeather(city: City, unit: Unit): Promise<number> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m&temperature_unit=${unit}`;
  const data = (await safeFetchJson(url)) as { current?: { temperature_2m?: number } };
  const temp = data.current?.temperature_2m;
  if (typeof temp !== "number") {
    throw new Error("La API no devolvió temperatura para esta ciudad.");
  }
  return temp;
}
