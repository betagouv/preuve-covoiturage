import { dateWithTz } from "@/pdc/services/policy/helpers/index.ts";
import { StatelessContextInterface, StatelessRuleHelper } from "../../interfaces/index.ts";

export interface IsAfterParams {
  date: Date;
}

export const isAfter: StatelessRuleHelper<IsAfterParams> = (
  ctx: StatelessContextInterface,
  params: IsAfterParams,
): boolean => {
  const ctxDate = dateWithTz(ctx.carpool.datetime);
  const paramsDate = dateWithTz(params.date);
  if (ctxDate >= paramsDate) {
    return true;
  }
  return false;
};
