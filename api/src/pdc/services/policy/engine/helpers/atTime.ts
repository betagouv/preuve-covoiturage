import {
  StatelessContextInterface,
  StatelessRuleHelper,
} from "../../interfaces/index.ts";
import { toZonedTime } from "./toZonedTime.ts";

interface AtTimeParams {
  start: number;
  end: number;
  tz?: string;
}
export const atTime: StatelessRuleHelper<AtTimeParams> = (
  ctx: StatelessContextInterface,
  params: AtTimeParams,
): boolean => {
  const hours = toZonedTime(ctx.carpool.datetime, params.tz).getHours();
  if (hours >= params.start && hours <= params.end) {
    return true;
  }
  return false;
};
