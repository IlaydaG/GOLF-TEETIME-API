import { SunData, TeeTime } from "../type";
import { countByStatus, getFirstPlayableTeeTime, getFirstTwilightTeeTime, getLastBookableTeeTime, } from "./teeTime";

interface TeeTimeTableRow {
  TEETIMEDATE: Date;
  FIRSTTEETIME: Date;
  LASTTEETIME: Date;
  TWILIGHTSTART: Date | null;
  TOTALTEETIME: number;
}

function toDateOnly(date: string): Date {
  return new Date(`${date}T00:00:00Z`);
}

function toTimeOnly(hh: number, mm: number): Date {
  return new Date(Date.UTC(1970, 0, 1, hh, mm));
}

function timeLabelToTimeOnly(time: string): Date {
  const [h, m] = time.split(":").map(Number);
  return toTimeOnly(h, m);
}

export function toTeeTimeTableRow(
  day: SunData,
  rows: TeeTime[]
): TeeTimeTableRow | undefined {
  const first = getFirstPlayableTeeTime(rows);
  const last = getLastBookableTeeTime(rows);

  if (!first || !last) return undefined;

  const twilightStart = getFirstTwilightTeeTime(rows);

  return {
    TEETIMEDATE: toDateOnly(day.date),
    FIRSTTEETIME: timeLabelToTimeOnly(first.time),
    LASTTEETIME: timeLabelToTimeOnly(last.time),
    TWILIGHTSTART: twilightStart ? timeLabelToTimeOnly(twilightStart.time) : null,
    TOTALTEETIME: countByStatus(rows, "OK"),
  };
}
