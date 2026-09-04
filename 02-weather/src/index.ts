import { EndOfInputError } from "./presentation/input.ts";
import { runMenu } from "./presentation/menu.ts";
import { printError } from "./presentation/output.ts";
import { loadCities, saveCities } from "./storage/citiesStorage.ts";
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from "./storage/settingsStorage.ts";
import { green } from "./utils/colors.ts";

async function bootstrap(): Promise<void> {
  try {
    await loadCities();
  } catch (err) {
    printError(err);
    await saveCities([]);
  }
  try {
    await loadSettings();
  } catch (err) {
    printError(err);
    await saveSettings(DEFAULT_SETTINGS);
  }
}

try {
  await bootstrap();
  await runMenu();
  console.log(green("\n  ¡Hasta luego!\n"));
} catch (err) {
  if (!(err instanceof EndOfInputError)) throw err;
  console.log(green("\n  ¡Hasta luego!\n"));
}
await new Promise((resolve) => setImmediate(resolve));
process.exit(0);
