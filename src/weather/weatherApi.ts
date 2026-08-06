import { WeatherApiResponse, WeatherDayData } from "../type";
import { getPrecipitationSeverity } from "./weatherCodeMap";

const LAT = 36.8578077;
const LNG = 31.0006614;
const FORECAST_DAYS = 14;

export async function getWeatherData(): Promise<WeatherDayData[]> {
  const apiKey = process.env.WEATHER_API_KEY;

  if (!apiKey) {
    throw new Error("WEATHER_API_KEY ortam değişkeni tanımlı değil.");
  }

  const url =
    `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}` +
    `&q=${LAT},${LNG}&days=${FORECAST_DAYS}&lang=tr`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Hava durumu verisi alınamadı.");
  }

  const data = (await response.json()) as WeatherApiResponse;

  return data.forecast.forecastday.map(({ date, day }) => ({
    date,
    weathercode: day.condition.code,
    weatherDescription: day.condition.text,
    severity: getPrecipitationSeverity(day.totalprecip_mm),
    tempMax: day.maxtemp_c,
    tempMin: day.mintemp_c,
    precipitationProbability: day.daily_chance_of_rain,
    precipitationSum: day.totalprecip_mm,
    humidity: day.avghumidity,
    windSpeed: day.maxwind_kph,
  }));
}
