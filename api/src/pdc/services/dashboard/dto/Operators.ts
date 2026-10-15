import { Infer, object, optional } from "@/lib/superstruct/index.ts";
import { Id, PlainText, Siret, Varchar } from "@/pdc/providers/superstruct/shared/index.ts";

export const Operators = object({
  id: optional(Id),
  search: optional(Varchar),
  page: optional(Id),
  limit: optional(Id),
});
export const CreateOperator = object({
  name: PlainText,
  siret: Siret,
});
export const DeleteOperator = object({
  id: Id,
});
export const UpdateOperator = object({
  id: Id,
  name: PlainText,
  siret: Siret,
});

export type Operators = Infer<typeof Operators>;
export type DeleteOperator = Infer<typeof DeleteOperator>;
export type CreateOperator = Infer<typeof CreateOperator>;
export type UpdateOperator = Infer<typeof UpdateOperator>;
