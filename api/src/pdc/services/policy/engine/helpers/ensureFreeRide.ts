import { StatelessContextInterface } from "../../interfaces/index.ts";

export const ensureFreeRide = (
  ctx: StatelessContextInterface,
  amount: number,
): number => {
  return Math.max(0, ctx.carpool.driver_revenue - amount);
};
