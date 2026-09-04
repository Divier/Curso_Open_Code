import { ask } from "../presentation/input.ts";
import { printCities } from "../presentation/output.ts";
import { loadCities, saveCities } from "../storage/citiesStorage.ts";
import { loadSettings, saveSettings } from "../storage/settingsStorage.ts";
import { cyan, green, red } from "../utils/colors.ts";

export async function removeCity(): Promise<void> {
  const [cities, settings] = await Promise.all([loadCities(), loadSettings()]);
  if (cities.length === 0) {
    console.log("\n  No hay ciudades para eliminar.\n");
    return;
  }
  console.log();
  printCities(cities, settings.defaultCityId);
  const answer = await ask(cyan("  Número de la ciudad a eliminar: "));
  const idx = Number.parseInt(answer, 10) - 1;
  const removed = Number.isNaN(idx) || idx < 0 || idx >= cities.length ? undefined : cities.splice(idx, 1)[0];
  if (!removed) {
    console.log(red("\n  Número no válido.\n"));
    return;
  }
  await saveCities(cities);
  if (settings.defaultCityId === removed.id) {
    await saveSettings({ ...settings, defaultCityId: null });
  }
  console.log(green(`\n  Ciudad eliminada: ${removed.name}, ${removed.country}\n`));
}
