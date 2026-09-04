import { addCity } from "../actions/addCity.ts";
import { allForecasts } from "../actions/getForecast.ts";
import { allWeather, defaultWeather } from "../actions/getWeather.ts";
import { listCities } from "../actions/listCities.ts";
import { removeCity } from "../actions/removeCity.ts";
import { updateSettings } from "../actions/settings.ts";
import { setDefaultCity } from "../actions/setDefaultCity.ts";
import { loadCities } from "../storage/citiesStorage.ts";
import { loadSettings } from "../storage/settingsStorage.ts";
import type { City } from "../types/City.ts";
import type { MenuOption } from "../types/MenuOption.ts";
import type { Unit } from "../types/Weather.ts";
import { bold, cyan, red } from "../utils/colors.ts";
import { MENU_LINE } from "../utils/constants.ts";
import { unitSymbol } from "../utils/format.ts";
import { ask, EndOfInputError } from "./input.ts";
import { printError } from "./output.ts";

function buildOptions(cities: City[], unit: Unit): MenuOption[] {
  return [
    { key: "1", label: "Clima de ciudad default", action: defaultWeather },
    { key: "2", label: `Clima de todas las ciudades (${cities.length})`, action: allWeather },
    { key: "3", label: "Buscar y agregar ciudad", action: addCity },
    { key: "4", label: "Eliminar ciudad", action: removeCity },
    { key: "5", label: "Establecer ciudad default", action: setDefaultCity },
    { key: "6", label: "Previsión 7 días", action: allForecasts },
    { key: "7", label: "Listar ciudades guardadas", action: listCities },
    { key: "8", label: `Ajustes (${unitSymbol(unit)})`, action: updateSettings },
    { key: "9", label: "Salir" },
  ];
}

function printMenu(options: MenuOption[]): void {
  console.log(cyan(MENU_LINE));
  console.log(cyan(bold("         WEATHER CLI")));
  console.log(cyan(MENU_LINE));
  options.forEach((option) => {
    console.log(cyan(`  ${option.key}. ${option.label}`));
  });
  console.log(cyan(MENU_LINE));
}

export async function runMenu(): Promise<void> {
  let running = true;
  while (running) {
    const [cities, settings] = await Promise.all([loadCities(), loadSettings()]);
    const options = buildOptions(cities, settings.unit);
    printMenu(options);
    const key = await ask(cyan("  Selecciona una opción: "));
    const option = options.find((o) => o.key === key);
    if (!option) {
      console.log(red("\n  Opción no válida.\n"));
      continue;
    }
    if (!option.action) {
      running = false;
      continue;
    }
    try {
      await option.action();
    } catch (err) {
      if (err instanceof EndOfInputError) throw err;
      printError(err);
    }
  }
}
