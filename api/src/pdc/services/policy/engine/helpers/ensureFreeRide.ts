import { StatelessContextInterface } from '../../interfaces';

export const ensureFreeRide = (ctx: StatelessContextInterface, amount: number): number => {
  return Math.max(0, ctx.carpool.cost - amount);
};
