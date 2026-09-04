import { getWeather } from "../api/weather.ts";
import { ask } from "../presentation/input.ts";
import {
  printCurrentWeather,
  printError,
  printNoCities,
  printNoDefaultCity,
} from "../presentation/output.ts";
import { loadCities } from "../storage/citiesStorage.ts";
import { loadSettings } from "../storage/settingsStorage.ts";
import { red, yellow } from "../utils/colors.ts";
import { unitSymbol } from "../utils/format.ts";

export async function defaultWeather(): Promise<void> {
  const [cities, settings] = await Promise.all([loadCities(), loadSettings()]);
  const city = cities.find((c) => c.id === settings.defaultCityId);
  if (!city) {
    printNoDefaultCity();
    return;
  }
  try {
    const temp = await getWeather(city, settings.unit);
    printCurrentWeather(city, temp, settings.unit);
  } catch (err) {
    printError(err);
  }
}

export async function allWeather(): Promise<void> {
  const [cities, settings] = await Promise.all([loadCities(), loadSettings()]);
  if (cities.length === 0) {
    printNoCities();
    return;
  }
  const results = await Promise.allSettled(cities.map((city) => getWeather(city, settings.unit)));
  console.log();
  cities.forEach((city, i) => {
    const result = results[i];
    if (result?.status === "fulfilled") {
      console.log(`  ${city.name}, ${city.country}: ${yellow(`${result.value.toFixed(1)} ${unitSymbol(settings.unit)}`)}`);
    } else {
      const reason = result?.status === "rejected" && result.reason instanceof Error ? result.reason.message : "sin datos";
      console.log(`  ${city.name}, ${city.country}: ${red(reason)}`);
    }
  });
  console.log();
}
