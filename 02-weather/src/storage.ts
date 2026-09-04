import type { AppState } from "./types.ts";

const DATA_FILE = "data.json";

const DEFAULT_STATE: AppState = {
  cities: [],
  defaultCityId: null,
  unit: "celsius",
};

export async function loadState(): Promise<AppState> {
  const file = Bun.file(DATA_FILE);
  if (!(await file.exists())) {
    await saveState(DEFAULT_STATE);
    return DEFAULT_STATE;
  }
  try {
    const data = (await file.json()) as Partial<AppState>;
    return {
      cities: Array.isArray(data.cities) ? data.cities : [],
      defaultCityId: data.defaultCityId ?? null,
      unit: data.unit === "fahrenheit" ? "fahrenheit" : "celsius",
    };
  } catch {
    console.log("  data.json no es válido, se reinició con datos vacíos.");
    return DEFAULT_STATE;
  }
}

export async function saveState(state: AppState): Promise<void> {
  await Bun.write(DATA_FILE, JSON.stringify(state, null, 2));
}
