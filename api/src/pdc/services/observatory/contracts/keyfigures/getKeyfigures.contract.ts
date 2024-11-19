import { Direction, INSEECode, PerimeterLabel, PerimeterType } from "@/pdc/services/geo/contracts/shared/Perimeter.ts";

export interface SingleResultInterface {
  territory: INSEECode;
  l_territory: PerimeterLabel;
  passengers: number;
  distance: number;
  duration: number;
  journeys: number;
  intra_journeys: number;
  has_incentive: number;
  occupation_rate: number;
  new_drivers: number;
  new_passengers: number;
  direction: Direction;
}

export type ResultInterface = SingleResultInterface[];

export interface ParamsInterface {
  year: number;
  month?: number;
  trimester?: number;
  semester?: number;
  type: PerimeterType; //type de territoire selectionné
  code: INSEECode; //code insee du territoire
  direction: Direction;
}

export const handlerConfig = {
  service: "observatory",
  method: "getKeyfigures",
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
