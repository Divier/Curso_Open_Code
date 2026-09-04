import type { Unit } from "./Weather.ts";

export interface Settings {
  unit: Unit;
  defaultCityId: string | null;
}
