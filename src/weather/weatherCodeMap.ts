import { WeatherSeverity } from "../type";

interface WeatherCodeInfo {
  description: string;
  severity: WeatherSeverity;
}

const WEATHER_CODE_MAP: Record<number, WeatherCodeInfo> = {
  0: { description: "Açık/Güneşli", severity: "none" },
  1: { description: "Az bulutlu", severity: "none" },
  2: { description: "Parçalı bulutlu", severity: "none" },
  3: { description: "Çok bulutlu", severity: "none" },
  45: { description: "Sisli", severity: "none" },
  48: { description: "Sisli", severity: "none" },
  51: { description: "Hafif yağmurlu", severity: "light" },
  53: { description: "Orta şiddetli yağmur", severity: "medium" },
  55: { description: "Yoğun/şiddetli yağmur", severity: "heavy" },
  56: { description: "Dondurucu yağmur", severity: "heavy" },
  57: { description: "Dondurucu yağmur", severity: "heavy" },
  61: { description: "Hafif yağmurlu", severity: "light" },
  63: { description: "Orta şiddetli yağmur", severity: "medium" },
  65: { description: "Yoğun/şiddetli yağmur", severity: "heavy" },
  66: { description: "Dondurucu yağmur", severity: "heavy" },
  67: { description: "Dondurucu yağmur", severity: "heavy" },
  71: { description: "Hafif kar", severity: "light" },
  73: { description: "Hafif kar", severity: "medium" },
  75: { description: "Yoğun kar", severity: "heavy" },
  77: { description: "Yoğun kar", severity: "heavy" },
  80: { description: "Hafif yağmurlu", severity: "light" },
  81: { description: "Orta şiddetli yağmur", severity: "medium" },
  82: { description: "Yoğun/şiddetli yağmur", severity: "heavy" },
  95: { description: "Fırtına", severity: "heavy" },
  96: { description: "Fırtına", severity: "heavy" },
  99: { description: "Fırtına", severity: "heavy" },
};

const UNKNOWN_WEATHER: WeatherCodeInfo = {
  description: "Bilinmeyen hava durumu",
  severity: "none",
};

const SEVERITY_ORDER: Record<WeatherSeverity, number> = {
  none: 0,
  light: 1,
  medium: 2,
  heavy: 3,
};

export function getPrecipitationSeverity(precipitationSum: number): WeatherSeverity {
  if (precipitationSum <= 0) return "none";
  if (precipitationSum <= 2) return "light";
  if (precipitationSum <= 10) return "medium";
  return "heavy";
}

export function getWeatherInfo(
  code: number,
  precipitationSum: number
): WeatherCodeInfo {
  const base = WEATHER_CODE_MAP[code] ?? UNKNOWN_WEATHER;
  const precipitationSeverity = getPrecipitationSeverity(precipitationSum);

  const severity =
    SEVERITY_ORDER[precipitationSeverity] > SEVERITY_ORDER[base.severity]
      ? precipitationSeverity
      : base.severity;

  return { description: base.description, severity };
}
