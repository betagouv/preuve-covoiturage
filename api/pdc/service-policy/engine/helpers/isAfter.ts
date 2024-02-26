import { utcToZonedTime } from './utcToZonedTime';
import { StatelessContextInterface, StatelessRuleHelper } from '../../interfaces';

interface IsAfterParams {
  date: Date;
  tz?: string;
}

export const isAfter: StatelessRuleHelper<IsAfterParams> = (
  ctx: StatelessContextInterface,
  params: IsAfterParams,
): boolean => {
  const ctxDate = utcToZonedTime(ctx.carpool.datetime, params.tz);
  const paramsDate = utcToZonedTime(params.date, params.tz);
  if (ctxDate >= paramsDate) {
    return true;
  }
  return false;
};
