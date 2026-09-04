export type Unit = "celsius" | "fahrenheit";

export interface City {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface AppState {
  cities: City[];
  defaultCityId: string | null;
  unit: Unit;
}
