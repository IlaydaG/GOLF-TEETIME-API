import { SunData, TeeTime } from "../type";
import { countByStatus, getFirstPlayableTeeTime, getLastBookableTeeTime } from "./teeTime";

interface GolfTeeTimeHoursRow {
  HOTELID: number;
  DEPID: number;
  PLACEID: number;
  DATEFROM: Date;
  DATETO: Date;
  FIRSTTEETIME: Date;
  LASTTEETIME: Date;
  TWILIGHTSTART: Date;
  TWILIGHTEND: Date;
  TOTALTEETIME: number;
  CREATORID: number;
  UPDATEUSER: number;
  CREATION_DATE: Date;
  LASTUPDATE_DATE: Date;
  ISDISABLED: boolean;
}

function toDateOnly(date: string): Date {
  return new Date(`${date}T00:00:00Z`);
}

function toTimeOnly(hh: number, mm: number, ss = 0): Date {
  return new Date(Date.UTC(1970, 0, 1, hh, mm, ss));
}

function timeLabelToTimeOnly(time: string): Date {
  const [h, m] = time.split(":").map(Number);
  return toTimeOnly(h, m);
}

function isoToTimeOnly(iso: string): Date {
  const [h, m, s] = iso.slice(11, 19).split(":").map(Number);
  return toTimeOnly(h, m, s);
}

export function toGolfTeeTimeRow(
  day: SunData,
  rows: TeeTime[]
): GolfTeeTimeHoursRow | undefined {
  const first = getFirstPlayableTeeTime(rows);
  const last = getLastBookableTeeTime(rows);

  if (!first || !last) return undefined;

  const today = new Date();

  return {
    HOTELID: 1,
    DEPID: 1,
    PLACEID: 1,
    DATEFROM: toDateOnly(day.date),
    DATETO: toDateOnly(day.date),
    FIRSTTEETIME: timeLabelToTimeOnly(first.time),
    LASTTEETIME: timeLabelToTimeOnly(last.time),
    TWILIGHTSTART: isoToTimeOnly(day.sunset),
    TWILIGHTEND: isoToTimeOnly(day.civilTwilightEnd),
    TOTALTEETIME: countByStatus(rows, "OK"),
    CREATORID: 1,
    UPDATEUSER: 1,
    CREATION_DATE: today,
    LASTUPDATE_DATE: today,
    ISDISABLED: false,
  };
}
