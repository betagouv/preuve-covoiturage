import { coerce, Infer, object, optional, string } from "@/lib/superstruct/index.ts";
import { Serial } from "@/pdc/providers/superstruct/shared/index.ts";

export const Users = object({
  id: optional(coerce(Serial, string(), (v) => parseInt(v))),
  territory_id: optional(coerce(Serial, string(), (v) => parseInt(v))),
  operator_id: optional(coerce(Serial, string(), (v) => parseInt(v))),
});

export type Users = Infer<typeof Users>;
