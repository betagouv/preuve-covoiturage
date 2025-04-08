import { Timezone } from "@/pdc/providers/validator/types.ts";

export type ExcelCampaignConfig = {
  tz: Timezone;
  booster_dates: Set<string>;
  extras: Record<string | number | symbol, any>;
};
