import { Infer, object, optional } from "@/lib/superstruct/index.ts";
import { Id } from "@/pdc/providers/superstruct/shared/index.ts";

export const Users = object({
  id: optional(Id),
  territory_id: optional(Id),
  operator_id: optional(Id),
});

export type Users = Infer<typeof Users>;
