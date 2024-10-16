import { StatelessContextInterface } from "../../interfaces/index.ts";

export interface PerKmParams {
  /**
   * amount per km
   */
  amount: number;
  /**
   * The distance offset to start multiplication
   */
  offset?: number;
  /**
   * The maximum distance to compute with
   */
  limit?: number;
}

/**
 * Multiply the carpool distance by the amount
 *
 * @example
 * // 0,10 € per km
 * perKm(ctx, { amount: 10 })
 *
 * @example
 * // 0,10 € per km, but limit to 30 km
 * perKm(ctx, { amount: 10, limit: 30_000 })
 *
 * @example
 * // 0,10 € per km, but start at 5 km
 * perKm(ctx, { amount: 10, offset: 5_000 })
 *
 * @param {StatelessContextInterface} ctx
 * @param {PerKmParams} params
 * @returns {number}
 */
export const perKm = (
  ctx: StatelessContextInterface,
  params: PerKmParams,
): number => {
  let { distance } = ctx.carpool;

  if (Number.isNaN(distance) || distance === 0) {
    return 0;
  }

  if (params.limit) {
    distance = Math.min(distance, params.limit);
  }

  if (params.offset) {
    distance -= params.offset;
  }

  return (distance / 1000) * params.amount;
};

/**
 * Multiply the amount by the number of seats booked by the passenger
 *
 * @example
 * // 0,10 € per seat
 * perSeat(ctx, 10)
 *
 * @param {StatelessContextInterface} ctx
 * @param {number} amount
 * @returns {number}
 */
export const perSeat = (
  ctx: StatelessContextInterface,
  amount: number,
): number => {
  return (ctx.carpool.seats || 1) * amount;
};
