import { Infer, object, optional } from "@/lib/superstruct/index.ts";
import { Id } from "@/pdc/providers/superstruct/shared/index.ts";

export const TerritoriesWithCampaign = object({
  operator_id: optional(Id),
});

export type TerritoriesWithCampaign = Infer<typeof TerritoriesWithCampaign>;
