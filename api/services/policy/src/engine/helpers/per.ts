import { StatelessContextInterface } from '../../interfaces';

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

export const perKm = (ctx: StatelessContextInterface, params: PerKmParams): number => {
  let distance = ctx.carpool.distance;
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

export const perSeat = (ctx: StatelessContextInterface, amount: number): number => {
  return (ctx.carpool.seats || 1) * amount;
};
