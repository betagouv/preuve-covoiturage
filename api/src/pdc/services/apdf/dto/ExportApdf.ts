import { array, Infer, object, optional } from "@/lib/superstruct/index.ts";
import { Serial, Timestamp, Tz } from "@/pdc/providers/superstruct/shared/index.ts";

export const ExportApdf = object({
  format: optional(object({
    tz: Tz,
  })),
  query: object({
    campaign_id: array(Serial),
    operator_id: optional(array(Serial)),
    date: optional(object({
      start: Timestamp,
      end: Timestamp,
    })),
  }),
});
export type ExportApdf = Infer<typeof ExportApdf>;
