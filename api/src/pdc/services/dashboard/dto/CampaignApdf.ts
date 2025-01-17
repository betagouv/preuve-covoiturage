import { Infer, object } from "@/lib/superstruct/index.ts";
import { Id } from "@/pdc/providers/superstruct/shared/index.ts";

export const CampaignApdf = object({
  campaign_id: Id,
});

export type CampaignApdf = Infer<typeof CampaignApdf>;
