import { ElektrawebInsertResponse, ElektrawebLoginResponse } from "../type";

//const ELEKTRAWEB_BASE_URL = "https://api.kayaelektra.com";
const ELEKTRAWEB_BASE_URL = "https://pmsapi.elektraweb.dev";

export async function login(): Promise<string> {
  const usercode = process.env.ELEKTRAWEB_USERCODE;
  const password = process.env.ELEKTRAWEB_PASSWORD;
  const tenant = process.env.ELEKTRAWEB_TENANT;

  if (!usercode || !password || !tenant) {
    throw new Error(
      "ELEKTRAWEB_USERCODE, ELEKTRAWEB_PASSWORD, ELEKTRAWEB_TENANT ortam değişkenleri tanımlı değil."
    );
  }

  const response = await fetch(`${ELEKTRAWEB_BASE_URL}/Login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      Action: "Login",
      Usercode: usercode,
      Password: password,
      Tenant: tenant,
      ttCaptchaCode: "",
      ttCaptchaId: "",
    }),
  });

  const data = (await response.json()) as ElektrawebLoginResponse;

  if (!response.ok || !data.Success) {
    throw new Error("Elektraweb login başarısız.");
  }

  return data.LoginToken;
}

export async function insertRow(
  tableName: string,
  rows: object[]
): Promise<ElektrawebInsertResponse> {
  const token = await login();
  const response = await fetch(`${ELEKTRAWEB_BASE_URL}/Insert`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      Action: "Insert",
      LoginToken: token,
      Object: tableName,
      Row: rows,
    }),
  });

  const data = (await response.json()) as ElektrawebInsertResponse;

  if (!response.ok || !data.Success) {
    throw new Error(`Elektraweb insert başarısız: ${JSON.stringify(data)}`);
  }

  return data;
}
