import { printCities, printNoCities } from "../presentation/output.ts";
import { loadCities } from "../storage/citiesStorage.ts";
import { loadSettings } from "../storage/settingsStorage.ts";

export async function listCities(): Promise<void> {
  const [cities, settings] = await Promise.all([loadCities(), loadSettings()]);
  if (cities.length === 0) {
    printNoCities();
    return;
  }
  console.log();
  printCities(cities, settings.defaultCityId);
  console.log();
}
