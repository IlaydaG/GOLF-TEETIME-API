import { ElektrawebSunDataRow } from "../type";
import { SunData as SunDataDbRow } from "../generated/prisma/client";

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatTime(date: Date): string {
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  const ss = String(date.getUTCSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

export function toElektrawebSunDataRow(day: SunDataDbRow): ElektrawebSunDataRow {
  const depId = process.env.ELEKTRAWEB_GOLF_DEPID;
  const placeId = process.env.ELEKTRAWEB_GOLF_PLACEID;

  if (!depId || !placeId) {
    throw new Error(
      "ELEKTRAWEB_GOLF_DEPID, ELEKTRAWEB_GOLF_PLACEID ortam değişkenleri tanımlı değil."
    );
  }

  return {
    DEPID: Number(depId),
    PLACEID: Number(placeId),
    DATE: formatDate(day.date),
    SUNRISE: formatTime(day.sunrise),
    SUNSET: formatTime(day.sunset),
    CIVILTWILIGHTBEGIN: formatTime(day.civilTwilightBegin),
    CIVILTWILIGHTEND: formatTime(day.civilTwilightEnd),
  };
}
