import { SunData, TeeTime, TeeTimeStatus } from "../type";
import sunData from "../../sunData.json";

const ALL_SUN_DATA = sunData as SunData[];

const AVAILABLE_YEARS = [
  ...new Set(ALL_SUN_DATA.map((day) => day.date.slice(0, 4))),
].sort();

const TABLE_START_TIME = "05:27";
const TABLE_END_TIME = "18:57";
const INTERVAL_MINUTES = 9;
export const ROUND_DURATION_MINUTES = 270; //  4.5 saat

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function toTimeLabel(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function buildStableTimeSlots(
  startTime: string,
  endTime: string,
  intervalMinutes: number
): string[] {
  const startTotal = toMinutes(startTime);
  const endTotal = toMinutes(endTime);
  const slots: string[] = [];

  for (let t = startTotal; t <= endTotal; t += intervalMinutes) {
    slots.push(toTimeLabel(t));
  }

  return slots;
}

// Tablo sabit 05:27 ile 18:57 - 9dk aralık - 91 satır
const STABLE_TIME_SLOTS = buildStableTimeSlots(
  TABLE_START_TIME,
  TABLE_END_TIME,
  INTERVAL_MINUTES
);

function toIstanbulDate(date: string, time: string): Date {
  return new Date(`${date}T${time}:00+03:00`); 
}

function resolveStatus(
  start: Date,
  finish: Date,
  sunrise: Date,
  sunset: Date,
  civilTwilightEnd: Date
): TeeTimeStatus {
  if (start.getTime() < sunrise.getTime()) return "-";
  if (finish.getTime() <= sunset.getTime()) return "OK";
  if (finish.getTime() <= civilTwilightEnd.getTime()) return "TWILIGHT";
  return "-";
}


function generateStableTeeTimeTable(
  day: SunData,
  roundDurationMinutes = ROUND_DURATION_MINUTES
): TeeTime[] {
  const sunrise = new Date(day.sunrise);
  const sunset = new Date(day.sunset);
  const civilTwilightEnd = new Date(day.civilTwilightEnd);
  const roundMs = roundDurationMinutes * 60 * 1000;

  return STABLE_TIME_SLOTS.map((time) => {
    const start = toIstanbulDate(day.date, time);
    const finish = new Date(start.getTime() + roundMs);
    const status = resolveStatus(start, finish, sunrise, sunset, civilTwilightEnd);

    return { time, start, finish, status };
  });
}

export function getStableTeeTimeTableForDate(
  date: string,
  roundDurationMinutes = ROUND_DURATION_MINUTES
): TeeTime[] | undefined {
  const day = ALL_SUN_DATA.find((d) => d.date === date);
  return day ? generateStableTeeTimeTable(day, roundDurationMinutes) : undefined;
}

export function getFirstPlayableTeeTime(rows: TeeTime[]): TeeTime | undefined {
  return rows.find((row) => row.status === "OK");
}

// OK'dan twilight'a geçilen ilk satır
export function getFirstTwilightTeeTime(rows: TeeTime[]): TeeTime | undefined {
  return rows.find((row) => row.status === "TWILIGHT");
}

export function getLastBookableTeeTime(rows: TeeTime[]): TeeTime | undefined {
  return [...rows].reverse().find((row) => row.status === "OK" || row.status === "TWILIGHT");
}

export function countByStatus(rows: TeeTime[], status: TeeTimeStatus): number {
  return rows.filter((row) => row.status === status).length;
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Istanbul",
  });
}

function printDay(date: string, roundDurationMinutes = ROUND_DURATION_MINUTES) {
  const rows = getStableTeeTimeTableForDate(date, roundDurationMinutes);

  if (!rows) {
    console.log(
      `${date} için veri bulunamadı. Desteklenen yıllar: ${AVAILABLE_YEARS.join(", ")}`
    );
    return;
  }

  console.log(`\n${date} - sabit tablo (${rows.length} satır):`);
  rows.forEach((row, i) => {
    console.log(`${i + 1}. ${row.time} | oyun bitisi: ${formatTime(row.finish)} [${row.status}]`);
  });

  const okCount = countByStatus(rows, "OK");
  const first = getFirstPlayableTeeTime(rows);
  const last = getLastBookableTeeTime(rows);
  const twilightStart = getFirstTwilightTeeTime(rows);

  console.log(`\nOynanabilir tee time sayısı: ${okCount}`);
  console.log(`First tee time: ${first ? first.time : "-"}`);
  console.log(`Last tee time: ${last ? last.time : "-"}`);
  console.log(`Twilight başlangıcı: ${twilightStart ? twilightStart.time : "-"}`);
}

function main() {
  const date = process.argv[2];

  if (!date) {
    console.log(
      `Kullanım: npx ts-node src/tee-time/teeTime.ts YYYY-MM-DD (${AVAILABLE_YEARS[0]}-${AVAILABLE_YEARS[AVAILABLE_YEARS.length - 1]} arası)`
    );
    return;
  }

  printDay(date);
}

if (require.main === module) {
  main();
}
