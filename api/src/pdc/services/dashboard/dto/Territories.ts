import { coerce, Infer, object, optional, string } from "@/lib/superstruct/index.ts";
import { Serial } from "@/pdc/providers/superstruct/shared/index.ts";

export const Territories = object({
  id: optional(coerce(Serial, string(), (v) => parseInt(v))),
});

export type Territories = Infer<typeof Territories>;
