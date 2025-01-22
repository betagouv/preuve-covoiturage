import { Infer, object, optional } from "@/lib/superstruct/index.ts";
import { Id } from "@/pdc/providers/superstruct/shared/index.ts";

export const Operators = object({
  id: optional(Id),
});

export type Operators = Infer<typeof Operators>;
