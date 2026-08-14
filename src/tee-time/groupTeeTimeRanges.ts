import { TeeTimeDayRow, TeeTimeRangeRow } from "../type";

function timeKey(value: Date | null): string {
  return value === null ? "null" : String(value.getTime());
}

function rowKey(row: TeeTimeDayRow): string {
  return [
    timeKey(row.FIRSTTEETIME),
    timeKey(row.LASTTEETIME),
    timeKey(row.TWILIGHT),
    row.TOTALTEETIME === null ? "null" : String(row.TOTALTEETIME),
  ].join("|");
}

function isNextCalendarDay(previous: Date, next: Date): boolean {
  const expected = new Date(previous);
  expected.setUTCDate(expected.getUTCDate() + 1);
  return expected.getTime() === next.getTime();
}

export function groupTeeTimeRanges(days: TeeTimeDayRow[]): TeeTimeRangeRow[] {
  const sorted = [...days].sort(
    (a, b) => a.TEETIMEDATE.getTime() - b.TEETIMEDATE.getTime()
  );

  const ranges: TeeTimeRangeRow[] = [];
  let currentKey: string | null = null;

  for (const day of sorted) {
    const key = rowKey(day);
    const current = ranges[ranges.length - 1];

    const canExtend =
      current !== undefined &&
      key === currentKey &&
      isNextCalendarDay(current.DATETO, day.TEETIMEDATE);

    if (canExtend) {
      current.DATETO = day.TEETIMEDATE;
    } else {
      ranges.push({
        DATEFROM: day.TEETIMEDATE,
        DATETO: day.TEETIMEDATE,
        FIRSTTEETIME: day.FIRSTTEETIME,
        LASTTEETIME: day.LASTTEETIME,
        TWILIGHT: day.TWILIGHT,
        TOTALTEETIME: day.TOTALTEETIME,
      });
      currentKey = key;
    }
  }

  return ranges;
}
