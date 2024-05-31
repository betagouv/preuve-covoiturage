import { OperatorsEnum } from '../../interfaces';

/**
 * Define a list of operators from a given datetime onwards
 *
 * Use in conjunction with `getOperatorsAt` to get
 * the list of operators at a given datetime
 *
 * @example
 *   protected operators: TimestampedOperators = [
 *     {
 *       date: new Date('2021-01-01T00:00:00+0100'),
 *       operators: [
 *         OperatorsEnum.BLABLACAR_DAILY,
 *         OperatorsEnum.KAROS,
 *       ],
 *     },
 *     {
 *       date: new Date('2022-01-01T00:00:00+0100'),
 *       operators: [
 *         OperatorsEnum.KLAXIT,
 *         OperatorsEnum.MOBICOOP,
 *       ],
 *     },
 *   ];
 */
export type TimestampedOperators = Array<{
  date: Date;
  operators: OperatorsEnum[];
}>;

/**
 * Get the list of operators at a given datetime (optional)
 *
 * @example
 * class MyCampaign ... {
 *   protected operators: TimestampedOperators = [
 *     {
 *       date: new Date('2021-01-01T00:00:00+0100'),
 *       operators: [
 *         OperatorsEnum.BLABLACAR_DAILY,
 *         OperatorsEnum.KAROS,
 *       ],
 *     },
 *     {
 *       date: new Date('2022-01-01T00:00:00+0100'),
 *       operators: [
 *         OperatorsEnum.KLAXIT,
 *         OperatorsEnum.MOBICOOP,
 *       ],
 *     },
 *   ];
 *
 *   ...
 *
 *   protected processExclusion(ctx: StatelessContextInterface) {
 *     isOperatorOrThrow(ctx, getOperatorsAt(this.operators, ctx.carpool.datetime));
 *     ...
 *   }
 * }
 * @param {TimestampedOperators} list
 * @param {Date} [current] defaults to the latest
 * @returns {OperatorsEnum[]}
 */
export function getOperatorsAt(list: TimestampedOperators, current?: Date): OperatorsEnum[] {
  if (!Array.isArray(list) || !list.length) return [];

  // sort list by date ascending
  const sorted = [...list].sort(({ date: dateA }, { date: dateB }) => {
    return dateA.getTime() > dateB.getTime() ? 1 : -1;
  });

  if (current) {
    // return an empty array if the current date is older than the first one
    if (current.getTime() < sorted[0].date.getTime()) return [];

    // match from the latest to the oldest
    for (const { date, operators } of sorted.reverse()) {
      if (current.getTime() >= date.getTime()) {
        return operators;
      }
    }
  }

  // return the last one or fallback
  if (Array.isArray(sorted) && sorted.length) {
    const last = sorted[sorted.length - 1];
    if ('operators' in last) return last.operators;
  }

  return [];
}
