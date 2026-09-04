import { geocode } from "../api/geocoding.ts";
import { ask } from "../presentation/input.ts";
import { printError } from "../presentation/output.ts";
import { loadCities, saveCities } from "../storage/citiesStorage.ts";
import { cyan, green, red } from "../utils/colors.ts";

export async function addCity(): Promise<void> {
  const name = await ask(cyan("  Nombre de la ciudad: "));
  if (!name) {
    console.log(red("\n  El nombre no puede estar vacío.\n"));
    return;
  }
  try {
    const city = await geocode(name);
    if (!city) {
      console.log(red(`\n  No se encontró "${name}".\n`));
      return;
    }
    const cities = await loadCities();
    const duplicate = cities.some(
      (c) =>
        c.name.toLowerCase() === city.name.toLowerCase() &&
        c.latitude === city.latitude &&
        c.longitude === city.longitude,
    );
    if (duplicate) {
      console.log(red(`\n  ${city.name}, ${city.country} ya está en tu lista.\n`));
      return;
    }
    await saveCities([...cities, city]);
    console.log(green(`\n  Ciudad agregada: ${city.name}, ${city.country}\n`));
  } catch (err) {
    printError(err);
  }
}
