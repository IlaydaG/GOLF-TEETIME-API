import sql from "mssql";
import { connectDB } from "../db";
import { getWeatherData } from "./weatherApi";

async function ensureTableExists(pool: sql.ConnectionPool) {
  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'weather_forecast')
    CREATE TABLE weather_forecast (
      id INT IDENTITY PRIMARY KEY,
      [date] DATE NOT NULL UNIQUE,
      weathercode INT NOT NULL,
      weather_description NVARCHAR(50) NOT NULL,
      severity NVARCHAR(10) NOT NULL,
      temp_max FLOAT NOT NULL,
      temp_min FLOAT NOT NULL,
      precipitation_probability INT NOT NULL,
      precipitation_sum FLOAT NOT NULL,
      humidity FLOAT NOT NULL DEFAULT 0,
      wind_speed FLOAT NOT NULL DEFAULT 0
    )

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('weather_forecast') AND name = 'humidity')
      ALTER TABLE weather_forecast ADD humidity FLOAT NOT NULL DEFAULT 0

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('weather_forecast') AND name = 'wind_speed')
      ALTER TABLE weather_forecast ADD wind_speed FLOAT NOT NULL DEFAULT 0
  `);
}

async function importData(pool: sql.ConnectionPool) {
  const data = await getWeatherData();

  for (const day of data) {
    await pool
      .request()
      .input("date", sql.Date, day.date)
      .input("weathercode", sql.Int, day.weathercode)
      .input("weatherDescription", sql.NVarChar, day.weatherDescription)
      .input("severity", sql.NVarChar, day.severity)
      .input("tempMax", sql.Float, day.tempMax)
      .input("tempMin", sql.Float, day.tempMin)
      .input("precipitationProbability", sql.Int, day.precipitationProbability)
      .input("precipitationSum", sql.Float, day.precipitationSum)
      .input("humidity", sql.Float, day.humidity)
      .input("windSpeed", sql.Float, day.windSpeed).query(`
        IF NOT EXISTS (SELECT 1 FROM weather_forecast WHERE [date] = @date)
          INSERT INTO weather_forecast
            ([date], weathercode, weather_description, severity, temp_max, temp_min, precipitation_probability, precipitation_sum, humidity, wind_speed)
          VALUES
            (@date, @weathercode, @weatherDescription, @severity, @tempMax, @tempMin, @precipitationProbability, @precipitationSum, @humidity, @windSpeed)
        ELSE
          UPDATE weather_forecast
          SET weathercode = @weathercode,
              weather_description = @weatherDescription,
              severity = @severity,
              temp_max = @tempMax,
              temp_min = @tempMin,
              precipitation_probability = @precipitationProbability,
              precipitation_sum = @precipitationSum,
              humidity = @humidity,
              wind_speed = @windSpeed
          WHERE [date] = @date
      `);
  }

  console.log(`${data.length} günlük hava durumu kaydı kontrol edildi/güncellendi.`);
}

async function main() {
  const pool = await connectDB();
  await ensureTableExists(pool);
  await importData(pool);
  await pool.close();
}

main();
