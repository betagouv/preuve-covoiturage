import { toZonedTime } from './toZonedTime';
import { StatelessContextInterface, StatelessRuleHelper } from '../../interfaces';

interface IsAfterParams {
  date: Date;
  tz?: string;
}

export const isAfter: StatelessRuleHelper<IsAfterParams> = (
  ctx: StatelessContextInterface,
  params: IsAfterParams,
): boolean => {
  const ctxDate = toZonedTime(ctx.carpool.datetime, params.tz);
  const paramsDate = toZonedTime(params.date, params.tz);
  if (ctxDate >= paramsDate) {
    return true;
  }
  return false;
};
