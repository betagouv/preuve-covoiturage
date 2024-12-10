import { Infer, object } from "@/lib/superstruct/index.ts";
import { Uuid } from "@/pdc/providers/superstruct/shared/index.ts";

export const DeleteApplication = object({
  uuid: Uuid,
});
export type DeleteApplication = Infer<typeof DeleteApplication>;
