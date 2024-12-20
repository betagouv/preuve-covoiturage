import { Infer, object } from "@/lib/superstruct/index.ts";
import { Uuid } from "@/pdc/providers/superstruct/shared/index.ts";

export const FindApplication = object({
  uuid: Uuid,
});
export type FindApplication = Infer<typeof FindApplication>;
