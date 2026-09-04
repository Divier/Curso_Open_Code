import type { Unit } from "../types/Weather.ts";
import { WEEKDAYS } from "./constants.ts";

export function unitSymbol(unit: Unit): string {
  return unit === "celsius" ? "°C" : "°F";
}

export function dayLabel(date: string): string {
  const weekday = WEEKDAYS[new Date(`${date}T00:00:00Z`).getUTCDay()] ?? "???";
  return `${weekday} ${date.slice(8, 10)}`;
}
