import { StatelessContextInterface } from '../interfaces';

export interface PerKmParams {
  amount: number;
  offset?: number;
  limit?: number;
}

export const perKm = (ctx: StatelessContextInterface, params: PerKmParams): number => {
  let distance = ctx.carpool.distance;
  if (Number.isNaN(distance) || distance === 0) {
    return 0;
  }

  if (params.offset) {
    distance -= params.offset;
  }

  if (params.limit) {
    distance = Math.min(distance, params.limit);
  }

  return (distance / 1000) * params.amount;
};

export const perSeat = (ctx: StatelessContextInterface, amount: number): number => {
  return (ctx.carpool.seats || 1) * amount;
};
