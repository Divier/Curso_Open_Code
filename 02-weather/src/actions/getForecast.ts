import { getForecast } from "../api/weather.ts";
import { printForecast, printNoCities } from "../presentation/output.ts";
import { loadCities } from "../storage/citiesStorage.ts";
import { loadSettings } from "../storage/settingsStorage.ts";
import { bold, cyan, red } from "../utils/colors.ts";
import { unitSymbol } from "../utils/format.ts";

export async function allForecasts(): Promise<void> {
  const [cities, settings] = await Promise.all([loadCities(), loadSettings()]);
  if (cities.length === 0) {
    printNoCities();
    return;
  }
  console.log(cyan("\n  Consultando previsión...\n"));
  const results = await Promise.allSettled(cities.map((city) => getForecast(city, settings.unit)));
  console.log(cyan(bold(`\n  Previsión 7 días (${unitSymbol(settings.unit)})`)));
  cities.forEach((city, i) => {
    const result = results[i];
    if (result?.status === "fulfilled") {
      printForecast(city, result.value);
    } else {
      const reason = result?.status === "rejected" && result.reason instanceof Error ? result.reason.message : "sin datos";
      console.log(`\n  ${city.name}, ${city.country}: ${red(reason)}`);
    }
  });
  console.log();
}
