import { object } from "@/lib/superstruct/index.ts";
import { Siret, Varchar } from "@/pdc/providers/superstruct/shared/index.ts";

export const CreateTerritory = object({
  name: Varchar,
  siret: Siret,
});