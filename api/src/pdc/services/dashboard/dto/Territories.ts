import { Infer, object, optional } from "@/lib/superstruct/index.ts";
import { Id } from "@/pdc/providers/superstruct/shared/index.ts";

export const Territories = object({
  id: optional(Id),
});

export type Territories = Infer<typeof Territories>;
