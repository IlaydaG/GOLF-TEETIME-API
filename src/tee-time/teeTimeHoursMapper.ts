import { GolfTeeTimeHoursRow, TeeTimeRangeRow } from "../type";

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatTime(date: Date | null): string | null {
  if (date === null) return null;

  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  const ss = String(date.getUTCSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

export function toGolfTeeTimeHoursRow(range: TeeTimeRangeRow): GolfTeeTimeHoursRow {
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
    DATEFROM: formatDate(range.DATEFROM),
    DATETO: formatDate(range.DATETO),
    FIRSTTEETIME: formatTime(range.FIRSTTEETIME),
    LASTTEETIME: formatTime(range.LASTTEETIME),
    TWILIGHT: formatTime(range.TWILIGHT),
    TEETIMECOUNT: range.TOTALTEETIME,
  };
}
