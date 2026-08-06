export interface SunData {
  date: string;
  sunrise: string;
  sunset: string;
  civilTwilightBegin: string;
  civilTwilightEnd: string;
}

export type WeatherSeverity = "none" | "light" | "medium" | "heavy";

export interface WeatherApiResponse {
  forecast: {
    forecastday: {
      date: string;
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        daily_chance_of_rain: number;
        totalprecip_mm: number;
        avghumidity: number;
        maxwind_kph: number;
        condition: {
          text: string;
          code: number;
        };
      };
    }[];
  };
}

export interface WeatherDayData {
  date: string;
  weathercode: number;
  weatherDescription: string;
  severity: WeatherSeverity;
  tempMax: number;
  tempMin: number;
  precipitationProbability: number;
  precipitationSum: number;
  humidity: number;
  windSpeed: number;
}