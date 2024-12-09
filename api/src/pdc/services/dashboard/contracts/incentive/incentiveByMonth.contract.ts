import { Direction } from "@/pdc/services/geo/contracts/shared/Perimeter.ts";

export interface SingleResultInterface {
  year: number;
  month: number;
  territory_id: string;
  direction: Direction;
  journeys: number;
  incented_journeys: number;
  incentive_amount: number;
}

export type ResultInterface = SingleResultInterface[];

export interface ParamsInterface {
  territory_id: string;
  year?: number;
  direction?: Direction;
}

export const handlerConfig = {
  service: "dashboard",
  method: "incentiveByMonth",
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
