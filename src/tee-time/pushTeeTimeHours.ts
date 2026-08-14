import "dotenv/config";
import { PrismaMssql } from "@prisma/adapter-mssql";
import { PrismaClient } from "../generated/prisma/client";
import { insertRow } from "../elektraweb/elektrawebClient";
import { toGolfTeeTimeHoursRow } from "./teeTimeHoursMapper";

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

  const allRanges = await prisma.tEETIME_RANGE.findMany({
    orderBy: { DATEFROM: "asc" },
  });

  const ranges = onlyYear
    ? allRanges.filter((range) => range.DATEFROM.getUTCFullYear() === onlyYear)
    : allRanges;

  if (ranges.length === 0) {
    console.log("Gönderilecek TEETIME_RANGE kaydı yok.");
    return;
  }

  const rowsByYear = new Map<number, ReturnType<typeof toGolfTeeTimeHoursRow>[]>();
  for (const range of ranges) {
    const year = range.DATEFROM.getUTCFullYear();
    const rows = rowsByYear.get(year) ?? [];
    rows.push(toGolfTeeTimeHoursRow(range));
    rowsByYear.set(year, rows);
  }

  for (const [year, rows] of rowsByYear) {
    const result = await insertRow("GOLF_TEETIME_HOURS", rows);
    console.log(`${year}: ${rows.length} satır -> ${result.Message}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
