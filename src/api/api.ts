import { writeFile } from "fs/promises";
import { SunData } from "../type";

const LAT = 36.8578077;
const LNG = 31.0006614;

async function getSunData() : Promise<SunData[]>{
  const allData: SunData[] = [];

  for(let year =2026; year <=2031; year++){
    const url =
      `https://api.sunrise-sunset.org/v2?lat=${LAT}&lng=${LNG}` +
      `&date_start=${year}-01-01` +
      `&date_end=${year}-12-31` +
      `&formatted=0`;

    const response =await fetch(url);

    if(!response.ok){
      throw new Error(`${year} yılı verisi alınamadı.`);
    }
    const data: any = await response.json();

    const yearData: SunData[] = data.days.map((day: any) => ({
      date: day.date,
      sunrise: day.sunrise,
      sunset: day.sunset,
      civilTwilightBegin: day.civil_twilight_begin,
      civilTwilightEnd: day.civil_twilight_end,
    }));

    allData.push(...yearData);

    console.log(`${year} yılı: ${yearData.length} kayıt alındı.`);
  }

  return allData;
}


async function main() {
  try {
    const data = await getSunData();

    await writeFile(
      "./sunData.json",
      JSON.stringify(data, null, 2),
      "utf-8"
    );

    console.log(`Toplam kayıt: ${data.length}`);
    console.log("sunData.json başarılı oluşturuldu.");
    console.log(data[0]);
    console.log(data[data.length - 1]);
  } catch (error) {
    console.error(error);
  }
}

main();