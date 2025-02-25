import { Infer, object, optional } from "@/lib/superstruct/index.ts";
import { Id, Siret, TerritoryType, Varchar } from "@/pdc/providers/superstruct/shared/index.ts";

export const Territories = object({
  id: optional(Id),
  page: optional(Id),
  limit: optional(Id),
});
export const CreateTerritory = object({
  name: Varchar,
  type: TerritoryType,
  siret: Siret,
});
export const DeleteTerritory = object({
  id: Id,
});
export const UpdateTerritory = object({
  id: Id,
  name: Varchar,
  type: TerritoryType,
  siret: Siret,
});

export type Territories = Infer<typeof Territories>;
export type DeleteTerritory = Infer<typeof DeleteTerritory>;
export type CreateTerritory = Infer<typeof CreateTerritory>;
export type UpdateTerritory = Infer<typeof UpdateTerritory>;
