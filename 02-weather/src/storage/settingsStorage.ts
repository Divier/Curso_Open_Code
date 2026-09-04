import type { Settings } from "../types/Settings.ts";

const SETTINGS_FILE = "settings.json";

export const DEFAULT_SETTINGS: Settings = {
  unit: "celsius",
  defaultCityId: null,
};

export async function loadSettings(): Promise<Settings> {
  const file = Bun.file(SETTINGS_FILE);
  if (!(await file.exists())) {
    await saveSettings(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }
  let data: unknown;
  try {
    data = await file.json();
  } catch {
    throw new Error("settings.json no es válido; se reiniciará con la configuración por defecto.");
  }
  const partial = (data ?? {}) as Partial<Settings>;
  return {
    unit: partial.unit === "fahrenheit" ? "fahrenheit" : "celsius",
    defaultCityId: partial.defaultCityId ?? null,
  };
}

export async function saveSettings(settings: Settings): Promise<void> {
  await Bun.write(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}
