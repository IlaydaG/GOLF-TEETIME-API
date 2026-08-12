import "dotenv/config";
import { PrismaMssql } from "@prisma/adapter-mssql";
import { PrismaClient } from "../generated/prisma/client";
import { groupTeeTimeRanges } from "./groupTeeTimeRanges";

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
  const days = await prisma.tEETIME_TABLE.findMany({
    orderBy: { TEETIMEDATE: "asc" },
  });

  const ranges = groupTeeTimeRanges(days);

  await prisma.$transaction([
    prisma.tEETIME_RANGE.deleteMany({}),
    prisma.tEETIME_RANGE.createMany({ data: ranges }),
  ]);

  console.log(`Toplam gün: ${days.length}`);
  console.log(`Oluşan aralık sayısı: ${ranges.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
