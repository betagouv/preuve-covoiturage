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
  if (ctxDate >= params.date) {
    return true;
  }
  return false;
};
