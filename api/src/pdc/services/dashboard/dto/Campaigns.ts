import { coerce, Infer, object, string } from "@/lib/superstruct/index.ts";
import { Serial } from "@/pdc/providers/superstruct/shared/index.ts";

export const Campaigns = object({
  territory_id: coerce(Serial, string(), (v) => parseInt(v)),
});

export type Campaigns = Infer<typeof Campaigns>;
