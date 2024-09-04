import { env_or_fail } from "@/lib/env/index.ts";

export const apiUrl = env_or_fail("APP_API_URL", "http://localhost:8080");
export const appUrl = env_or_fail("APP_APP_URL", "http://localhost:4200");
export const printerUrl = env_or_fail(
  "APP_PRINTER_URL",
  "http://localhost:3000",
);

export const certificateBaseUrl = `${apiUrl}/v3/certificates`;
