import { env_or_fail } from "@/lib/env/index.ts";

export const to = env_or_fail(
  "APP_CONTACTFORM_TO",
  "contact@covoiturage.beta.gouv.fr",
);
