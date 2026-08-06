import { connectDB } from "./db";

async function test() {
  try {
    await connectDB();
    console.log("Bağlantı testi başarılı.");
  } catch (error) {
    console.error(error);
  }
}

test();