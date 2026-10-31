import "dotenv/config";
import { PrismaMssql } from "@prisma/adapter-mssql";
import { PrismaClient } from "../generated/prisma/client";
import { insertRow } from "../elektraweb/elektrawebClient";
import { toElektrawebSunDataRow } from "./sunDataMapper";

const ELEKTRAWEB_SUNDATA_OBJECT = "GOLF_SUNDATA";

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

async function main() {
  const onlyYear = process.argv[2] ? Number(process.argv[2]) : undefined;

  const allDays = await prisma.sunData.findMany({
    orderBy: { date: "asc" },
  });

  const days = onlyYear
    ? allDays.filter((day) => day.date.getUTCFullYear() === onlyYear)
    : allDays;

  if (days.length === 0) {
    console.log("Gönderilecek SunData kaydı yok.");
    return;
  }

  const rowsByYear = new Map<number, ReturnType<typeof toElektrawebSunDataRow>[]>();
  for (const day of days) {
    const year = day.date.getUTCFullYear();
    const rows = rowsByYear.get(year) ?? [];
    rows.push(toElektrawebSunDataRow(day));
    rowsByYear.set(year, rows);
  }

  for (const [year, rows] of rowsByYear) {
    const result = await insertRow(ELEKTRAWEB_SUNDATA_OBJECT, rows);
    console.log(`${year}: ${rows.length} satır -> ${result.Message}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
