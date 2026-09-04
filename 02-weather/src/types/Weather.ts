export type Unit = "celsius" | "fahrenheit";

export interface DailyForecast {
  date: string;
  tempMax: number;
  tempMin: number;
  weatherCode: number;
  rainProbability: number | null;
}
