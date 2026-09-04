import type { City } from "../types/City.ts";
import { safeFetchJson } from "./http.ts";

interface GeoResult {
  name: string;
  country: string | null;
  latitude: number;
  longitude: number;
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
