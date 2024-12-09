import { Direction } from "@/pdc/services/geo/contracts/shared/Perimeter.ts";

export interface SingleResultInterface {
  date: Date;
  territory_id: string;
  direction: Direction;
  journeys: number;
  incented_journeys: number;
  incentive_amount: number;
}

export type ResultInterface = SingleResultInterface[];

export interface ParamsInterface {
  territory_id: string;
  date?: Date;
  direction?: Direction;
}

export const handlerConfig = {
  service: "dashboard",
  method: "incentiveByDay",
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
