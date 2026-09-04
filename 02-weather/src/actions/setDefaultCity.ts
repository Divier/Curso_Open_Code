import { ask } from "../presentation/input.ts";
import { printCities } from "../presentation/output.ts";
import { loadCities } from "../storage/citiesStorage.ts";
import { loadSettings, saveSettings } from "../storage/settingsStorage.ts";
import { cyan, green, red } from "../utils/colors.ts";

export async function setDefaultCity(): Promise<void> {
  const [cities, settings] = await Promise.all([loadCities(), loadSettings()]);
  if (cities.length === 0) {
    console.log("\n  No hay ciudades. Agrega una con la opción 3.\n");
    return;
  }
  console.log();
  printCities(cities, settings.defaultCityId);
  const answer = await ask(cyan("  Número de la ciudad default: "));
  const idx = Number.parseInt(answer, 10) - 1;
  const city = cities[idx];
  if (Number.isNaN(idx) || idx < 0 || idx >= cities.length || !city) {
    console.log(red("\n  Número no válido.\n"));
    return;
  }
  await saveSettings({ ...settings, defaultCityId: city.id });
  console.log(green(`\n  Ciudad default: ${city.name}, ${city.country}\n`));
}
