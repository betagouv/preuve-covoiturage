import { Infer, object, optional, string } from "@/lib/superstruct/index.ts";
import { Id } from "@/pdc/providers/superstruct/shared/index.ts";

export const Territories = object({
  id: optional(Id),
  page: optional(Id),
  limit: optional(Id),
});
export const CreateTerritory = object({
  name: string(),
});
export const DeleteTerritory = object({
  id: Id,
});
export const UpdateTerritory = object({
  id: Id,
  name: string(),
});

export type Territories = Infer<typeof Territories>;
export type DeleteTerritory = Infer<typeof DeleteTerritory>;
export type CreateTerritory = Infer<typeof CreateTerritory>;
export type UpdateTerritory = Infer<typeof UpdateTerritory>;
