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

export type TeeTimeStatus = "OK" | "TWILIGHT" | "-";

export interface TeeTime {
  time: string;
  start: Date;
  finish: Date;
  status: TeeTimeStatus;
}

export interface TeeTimeDayRow {
  TEETIMEDATE: Date;
  FIRSTTEETIME: Date | null;
  LASTTEETIME: Date | null;
  TWILIGHT: Date | null;
  TOTALTEETIME: number | null;
}

export interface TeeTimeRangeRow {
  DATEFROM: Date;
  DATETO: Date;
  FIRSTTEETIME: Date | null;
  LASTTEETIME: Date | null;
  TWILIGHT: Date | null;
  TOTALTEETIME: number | null;
}

export interface TeeTimeTableRow {
  TEETIMEDATE: Date;
  FIRSTTEETIME: Date;
  LASTTEETIME: Date;
  TWILIGHT: Date | null;
  TOTALTEETIME: number;
}

export interface GolfTeeTimeHoursRow {
  DEPID: number;
  PLACEID: number;
  DATEFROM: string;
  DATETO: string;
  FIRSTTEETIME: string | null;
  LASTTEETIME: string | null;
  TWILIGHT: string | null;
  TEETIMECOUNT: number | null;
}

export interface ElektrawebSunDataRow {
  DEPID: number;
  PLACEID: number;
  DATE: string;
  SUNRISE: string;
  SUNSET: string;
  CIVILTWILIGHTBEGIN: string;
  CIVILTWILIGHTEND: string;
}

export interface ElektrawebLoginResponse {
  Success: boolean;
  LoginToken: string;
}

export interface ElektrawebInsertResponse {
  Success: boolean;
  PrimaryKey: number;
  PrimaryKeys: number[];
  Message: string;
}