import { readFile } from "fs/promises";
import sql from "mssql";
import { connectDB, connectMaster } from "./db";
import { SunData } from "./type";

async function ensureDatabaseExists() {
  const pool = await connectMaster();
  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'SunriseDB')
    CREATE DATABASE SunriseDB
  `);
  await pool.close();
}

async function ensureTableExists(pool: sql.ConnectionPool) {
  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SunData')
    CREATE TABLE SunData (
      id INT IDENTITY PRIMARY KEY,
      [date] DATE NOT NULL UNIQUE,
      sunrise DATETIMEOFFSET NOT NULL,
      sunset DATETIMEOFFSET NOT NULL,
      civilTwilightBegin DATETIMEOFFSET NOT NULL,
      civilTwilightEnd DATETIMEOFFSET NOT NULL
    )
  `);
}

async function importData(pool: sql.ConnectionPool) {
  const raw = await readFile("./sunData.json", "utf-8");
  const data: SunData[] = JSON.parse(raw);

  for (const day of data) {
    await pool
      .request()
      .input("date", sql.Date, day.date)
      .input("sunrise", sql.DateTimeOffset, day.sunrise)
      .input("sunset", sql.DateTimeOffset, day.sunset)
      .input("civilTwilightBegin", sql.DateTimeOffset, day.civilTwilightBegin)
      .input("civilTwilightEnd", sql.DateTimeOffset, day.civilTwilightEnd).query(`
        IF NOT EXISTS (SELECT 1 FROM SunData WHERE [date] = @date)
        INSERT INTO SunData ([date], sunrise, sunset, civilTwilightBegin, civilTwilightEnd)
        VALUES (@date, @sunrise, @sunset, @civilTwilightBegin, @civilTwilightEnd)
      `);
  }

  console.log(`${data.length} kayıt kontrol edildi/eklendi.`);
}

export async function getSunDataByDate(pool: sql.ConnectionPool, date: string) {
  const result = await pool
    .request()
    .input("date", sql.Date, date)
    .query("SELECT * FROM SunData WHERE [date] = @date");

  return result.recordset[0];
}

async function main() {
  await ensureDatabaseExists();

  const pool = await connectDB();
  await ensureTableExists(pool);
  await importData(pool);

  const example = await getSunDataByDate(pool, "2026-01-01");
  console.log("Örnek sorgu (2026-01-01):", example);

  await pool.close();
}

main();
