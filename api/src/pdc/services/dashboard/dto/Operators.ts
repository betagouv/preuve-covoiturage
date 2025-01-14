import { coerce, Infer, object, optional, string } from "@/lib/superstruct/index.ts";
import { Serial } from "@/pdc/providers/superstruct/shared/index.ts";

export const Operators = object({
  id: optional(coerce(Serial, string(), (v) => parseInt(v))),
});

export type Operators = Infer<typeof Operators>;
