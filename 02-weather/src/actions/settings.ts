import { ask } from "../presentation/input.ts";
import { loadSettings, saveSettings } from "../storage/settingsStorage.ts";
import type { Unit } from "../types/Weather.ts";
import { cyan, green, red } from "../utils/colors.ts";
import { unitSymbol } from "../utils/format.ts";

export async function updateSettings(): Promise<void> {
  const settings = await loadSettings();
  console.log(`\n  Unidad actual: ${unitSymbol(settings.unit)}`);
  console.log(cyan("  1. Celsius (°C)"));
  console.log(cyan("  2. Fahrenheit (°F)\n"));
  const answer = await ask(cyan("  Selecciona una opción: "));
  if (answer !== "1" && answer !== "2") {
    console.log(red("\n  Opción no válida.\n"));
    return;
  }
  const unit: Unit = answer === "1" ? "celsius" : "fahrenheit";
  if (unit === settings.unit) {
    console.log("\n  Ya estás usando esa unidad.\n");
    return;
  }
  await saveSettings({ ...settings, unit });
  console.log(green(`\n  Unidad establecida: ${unitSymbol(unit)}\n`));
}
