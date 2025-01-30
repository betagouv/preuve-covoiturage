import { Infer, object, optional } from "@/lib/superstruct/index.ts";
import { TerritoryCode, TerritoryType, Year } from "@/pdc/providers/superstruct/shared/index.ts";

export const IncentiveCampaigns = object({
  year: optional(Year),
  type: optional(TerritoryType),
  code: optional(TerritoryCode),
});

export type IncentiveCampaigns = Infer<typeof IncentiveCampaigns>;
