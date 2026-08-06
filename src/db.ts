import "dotenv/config";
import sql from "mssql";

const baseConfig: sql.config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER as string,
  port: Number(process.env.DB_PORT),
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

export async function connectDB() {
  try {
    const pool = await sql.connect({
      ...baseConfig,
      database: process.env.DB_DATABASE,
    });
    console.log("MSSQL bağlandı");
    return pool;
  } catch (error) {
    console.error("MSSQL bağlanamıyor", error);
    throw error;
  }
}

export async function connectMaster() {
  return sql.connect(baseConfig);
}