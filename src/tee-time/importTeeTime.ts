import "dotenv/config";
import { PrismaMssql } from "@prisma/adapter-mssql";
import { PrismaClient } from "../generated/prisma/client";
import sunData from "../../sunData.json";
import { SunData } from "../type";
import { getStableTeeTimeTableForDate, ROUND_DURATION_MINUTES } from "./teeTime";
import { toGolfTeeTimeRow } from "./teeTimeMapper";

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

async function importDay(day: SunData, roundDurationMinutes: number): Promise<ImportResult> {
  const rows = getStableTeeTimeTableForDate(day.date, roundDurationMinutes);
  if (!rows) return "skipped";

  const row = toGolfTeeTimeRow(day, rows);
  if (!row) return "skipped";

  const existing = await prisma.gOLF_TEETIME_HOURS.findFirst({
    where: {
      HOTELID: row.HOTELID,
      DEPID: row.DEPID,
      PLACEID: row.PLACEID,
      DATEFROM: row.DATEFROM,
    },
  });

  if (existing) {
    await prisma.gOLF_TEETIME_HOURS.update({
      where: { ID: existing.ID },
      data: row,
    });
    return "updated";
  }

  await prisma.gOLF_TEETIME_HOURS.create({ data: row });
  return "created";
}

async function main() {
  const days = sunData as SunData[];

  const roundDurationHours = process.argv[2] ? Number(process.argv[2]) : ROUND_DURATION_MINUTES / 60;
  const roundDurationMinutes = Math.round(roundDurationHours * 60);

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const day of days) {
    const result = await importDay(day, roundDurationMinutes);
    if (result === "created") created++;
    else if (result === "updated") updated++;
    else skipped++;
  }

  console.log(`Tur süresi: ${roundDurationHours} saat`);
  console.log(`Toplam gün: ${days.length}`);
  console.log(`Oluşturulan: ${created}, Güncellenen: ${updated}, Atlanan: ${skipped}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
