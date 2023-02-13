import { StatelessContextInterface, StatelessRuleHelper } from '../../shared/policy/common/interfaces/PolicyInterface';
import { utcToZonedTime } from './utcToZonedTime';

interface AtTimeParams {
  start: number;
  end: number;
  tz?: string;
}
export const atTime: StatelessRuleHelper<AtTimeParams> = (
  ctx: StatelessContextInterface,
  params: AtTimeParams,
): boolean => {
  const hours = utcToZonedTime(ctx.carpool.datetime, params.tz).getHours();
  if (hours >= params.start && hours <= params.end) {
    return true;
  }
  return false;
};
