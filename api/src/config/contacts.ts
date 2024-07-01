import { env_or_default } from "@/lib/env/index.ts";

export const support = {
  email: env_or_default(
    "APP_CONTACT_SUPPORT_EMAIL",
    "technique@covoiturage.beta.gouv.fr",
  ),
  fullname: env_or_default(
    "APP_CONTACT_SUPPORT_FULLNAME",
    "Equipe technique covoiturage",
  ),
};
