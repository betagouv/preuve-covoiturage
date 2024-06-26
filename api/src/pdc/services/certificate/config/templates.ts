import { env_or_fail } from "@/lib/env/index.ts";

const apiUrl = env_or_fail("APP_API_URL", "http://localhost:8080");
const appUrl = env_or_fail("APP_APP_URL", "http://localhost:4200");

export const certificate = {
  apiUrl,
  appUrl,
  title: "Attestation de covoiturage",
  contact: {
    url: "https://covoiturage.beta.gouv.fr",
    email: "contact@covoiturage.beta.gouv.fr",
  },
  support: "attestation@covoiturage.beta.gouv.fr",
  validation: {
    url: `${appUrl}/attestation`,
  },
};
