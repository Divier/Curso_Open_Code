import { geocode, getWeather } from "./src/api.ts";
import { ask, EndOfInputError } from "./src/input.ts";
import { loadState, saveState } from "./src/storage.ts";
import type { AppState, City, Unit } from "./src/types.ts";

const MENU_LINE = "═".repeat(40);

function unitSymbol(unit: Unit): string {
  return unit === "celsius" ? "°C" : "°F";
}

function printMenu(state: AppState): void {
  console.log(MENU_LINE);
  console.log("         WEATHER CLI");
  console.log(MENU_LINE);
  console.log("  1. Clima de ciudad default");
  console.log(`  2. Clima de todas las ciudades (${state.cities.length})`);
  console.log("  3. Buscar y agregar ciudad");
  console.log("  4. Eliminar ciudad");
  console.log("  5. Establecer ciudad default");
  console.log(`  8. Ajustes (${unitSymbol(state.unit)})`);
  console.log("  9. Salir");
  console.log(MENU_LINE);
}

function printCities(state: AppState): void {
  state.cities.forEach((city, i) => {
    const def = city.id === state.defaultCityId ? " (default)" : "";
    console.log(`  ${i + 1}. ${city.name}, ${city.country}${def}`);
  });
}

function printError(err: unknown): void {
  const msg = err instanceof Error ? err.message : "Error desconocido.";
  console.log(`\n  ${msg}\n`);
}

async function showWeather(city: City, unit: Unit): Promise<void> {
  const temp = await getWeather(city, unit);
  console.log(`\n  Clima actual en ${city.name}, ${city.country}: ${temp.toFixed(1)} ${unitSymbol(unit)}\n`);
}

async function defaultWeather(state: AppState): Promise<void> {
  const city = state.cities.find((c) => c.id === state.defaultCityId);
  if (!city) {
    console.log("\n  No hay ciudad default. Agrega una con la opción 3 y establécela con la 5.\n");
    return;
  }
  try {
    await showWeather(city, state.unit);
  } catch (err) {
    printError(err);
  }
}

async function allWeather(state: AppState): Promise<void> {
  if (state.cities.length === 0) {
    console.log("\n  No hay ciudades guardadas. Agrega una con la opción 3.\n");
    return;
  }
  const results = await Promise.allSettled(state.cities.map((c) => getWeather(c, state.unit)));
  console.log();
  state.cities.forEach((city, i) => {
    const result = results[i];
    if (result?.status === "fulfilled") {
      console.log(`  ${city.name}, ${city.country}: ${result.value.toFixed(1)} ${unitSymbol(state.unit)}`);
    } else {
      const reason = result?.status === "rejected" && result.reason instanceof Error ? result.reason.message : "sin datos";
      console.log(`  ${city.name}, ${city.country}: ${reason}`);
    }
  });
  console.log();
}

async function addCity(state: AppState): Promise<void> {
  const name = await ask("  Nombre de la ciudad: ");
  if (!name) {
    console.log("\n  El nombre no puede estar vacío.\n");
    return;
  }
  try {
    const city = await geocode(name);
    if (!city) {
      console.log(`\n  No se encontró "${name}".\n`);
      return;
    }
    const duplicate = state.cities.some(
      (c) =>
        c.name.toLowerCase() === city.name.toLowerCase() &&
        c.latitude === city.latitude &&
        c.longitude === city.longitude,
    );
    if (duplicate) {
      console.log(`\n  ${city.name}, ${city.country} ya está en tu lista.\n`);
      return;
    }
    state.cities.push(city);
    await saveState(state);
    console.log(`\n  Ciudad agregada: ${city.name}, ${city.country}\n`);
  } catch (err) {
    printError(err);
  }
}

async function removeCity(state: AppState): Promise<void> {
  if (state.cities.length === 0) {
    console.log("\n  No hay ciudades para eliminar.\n");
    return;
  }
  console.log();
  printCities(state);
  const answer = await ask("  Número de la ciudad a eliminar: ");
  const idx = Number.parseInt(answer, 10) - 1;
  const removed = Number.isNaN(idx) || idx < 0 || idx >= state.cities.length ? undefined : state.cities.splice(idx, 1)[0];
  if (!removed) {
    console.log("\n  Número no válido.\n");
    return;
  }
  if (state.defaultCityId === removed.id) {
    state.defaultCityId = null;
  }
  await saveState(state);
  console.log(`\n  Ciudad eliminada: ${removed.name}, ${removed.country}\n`);
}

async function setDefault(state: AppState): Promise<void> {
  if (state.cities.length === 0) {
    console.log("\n  No hay ciudades. Agrega una con la opción 3.\n");
    return;
  }
  console.log();
  printCities(state);
  const answer = await ask("  Número de la ciudad default: ");
  const idx = Number.parseInt(answer, 10) - 1;
  const city = state.cities[idx];
  if (Number.isNaN(idx) || idx < 0 || idx >= state.cities.length || !city) {
    console.log("\n  Número no válido.\n");
    return;
  }
  state.defaultCityId = city.id;
  await saveState(state);
  console.log(`\n  Ciudad default: ${city.name}, ${city.country}\n`);
}

async function settings(state: AppState): Promise<void> {
  console.log(`\n  Unidad actual: ${unitSymbol(state.unit)}`);
  console.log("  1. Celsius (°C)");
  console.log("  2. Fahrenheit (°F)\n");
  const answer = await ask("  Selecciona una opción: ");
  if ((answer === "1" && state.unit === "celsius") || (answer === "2" && state.unit === "fahrenheit")) {
    console.log("\n  Ya estás usando esa unidad.\n");
    return;
  }
  if (answer === "1") {
    state.unit = "celsius";
  } else if (answer === "2") {
    state.unit = "fahrenheit";
  } else {
    console.log("\n  Opción no válida.\n");
    return;
  }
  await saveState(state);
  console.log(`\n  Unidad establecida: ${unitSymbol(state.unit)}\n`);
}

async function main(): Promise<void> {
  const state = await loadState();

  let running = true;
  while (running) {
    printMenu(state);
    const option = await ask("  Selecciona una opción: ");
    switch (option) {
      case "1":
        await defaultWeather(state);
        break;
      case "2":
        await allWeather(state);
        break;
      case "3":
        await addCity(state);
        break;
      case "4":
        await removeCity(state);
        break;
      case "5":
        await setDefault(state);
        break;
      case "8":
        await settings(state);
        break;
      case "9":
        running = false;
        break;
      default:
        console.log("\n  Opción no válida.\n");
    }
  }
}

try {
  await main();
  console.log("\n  ¡Hasta luego!\n");
} catch (err) {
  if (!(err instanceof EndOfInputError)) throw err;
  console.log("\n  ¡Hasta luego!\n");
}
await new Promise((resolve) => setImmediate(resolve));
process.exit(0);
