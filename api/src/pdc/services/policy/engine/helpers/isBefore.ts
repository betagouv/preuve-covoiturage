import { dateWithTz } from "@/pdc/services/policy/helpers/index.ts";
import { StatelessContextInterface, StatelessRuleHelper } from "../../interfaces/index.ts";

export const isBefore: StatelessRuleHelper<Date> = (
  ctx: StatelessContextInterface,
  params: Date,
): boolean => {
  const ctxDate = dateWithTz(ctx.carpool.datetime);
  const paramsDate = dateWithTz(params);
  if (ctxDate <= paramsDate) {
    return true;
  }
  return false;
};
