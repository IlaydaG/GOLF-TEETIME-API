import "dotenv/config";
import { PrismaMssql } from "@prisma/adapter-mssql";
import { PrismaClient } from "../generated/prisma/client";
import sunData from "../../sunData.json";
import { SunData } from "../type";
import {
  getStableTeeTimeTableForDate,
  ROUND_DURATION_MINUTES,
  TWILIGHT_ROUND_DURATION_MINUTES,
} from "./teeTime";
import { toTeeTimeTableRow } from "./teeTimeMapper";

const adapter = new PrismaMssql({
  server: process.env.DB_SERVER as string,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
});

const prisma = new PrismaClient({ adapter });

type ImportResult = "created" | "updated" | "skipped";

async function importDay(
  day: SunData,
  roundDurationMinutes: number,
  twilightRoundDurationMinutes: number
): Promise<ImportResult> {
  const rows = getStableTeeTimeTableForDate(day.date, roundDurationMinutes, twilightRoundDurationMinutes);
  if (!rows) return "skipped";

  const row = toTeeTimeTableRow(day, rows);
  if (!row) return "skipped";

  const existing = await prisma.tEETIME_TABLE.findUnique({
    where: { TEETIMEDATE: row.TEETIMEDATE },
  });

  if (existing) {
    await prisma.tEETIME_TABLE.update({
      where: { TEETIMEDATE: row.TEETIMEDATE },
      data: row,
    });
    return "updated";
  }

  await prisma.tEETIME_TABLE.create({ data: row });
  return "created";
}

async function main() {
  const days = sunData as SunData[];

  const roundDurationHours = process.argv[2] ? Number(process.argv[2]) : ROUND_DURATION_MINUTES / 60;
  const roundDurationMinutes = Math.round(roundDurationHours * 60);

  const twilightRoundDurationHours = process.argv[3]
    ? Number(process.argv[3])
    : TWILIGHT_ROUND_DURATION_MINUTES / 60;
  const twilightRoundDurationMinutes = Math.round(twilightRoundDurationHours * 60);

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const day of days) {
    const result = await importDay(day, roundDurationMinutes, twilightRoundDurationMinutes);
    if (result === "created") created++;
    else if (result === "updated") updated++;
    else skipped++;
  }

  console.log(`Tur süresi: ${roundDurationHours} saat`);
  console.log(`Twilight tur süresi: ${twilightRoundDurationHours} saat`);
  console.log(`Toplam gün: ${days.length}`);
  console.log(`Oluşturulan: ${created}, Güncellenen: ${updated}, Atlanan: ${skipped}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
