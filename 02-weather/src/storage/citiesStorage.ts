import type { City } from "../types/City.ts";

const CITIES_FILE = "cities.json";

function invalidFileError(): Error {
  return new Error("cities.json no es válido; se reiniciará con una lista vacía.");
}

export async function loadCities(): Promise<City[]> {
  const file = Bun.file(CITIES_FILE);
  if (!(await file.exists())) {
    await saveCities([]);
    return [];
  }
  let data: unknown;
  try {
    data = await file.json();
  } catch {
    throw invalidFileError();
  }
  if (!Array.isArray(data)) {
    throw invalidFileError();
  }
  return data as City[];
}

export async function saveCities(cities: City[]): Promise<void> {
  await Bun.write(CITIES_FILE, JSON.stringify(cities, null, 2));
}
