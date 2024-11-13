import { INSEECode, PerimeterLabel, PerimeterType } from "@/pdc/services/geo/contracts/shared/Perimeter.ts";

export interface SingleResultInterface {
  territory: INSEECode;
  l_territory: PerimeterLabel;
  journeys: number;
}

export type ResultInterface = SingleResultInterface[];

export interface ParamsInterface {
  year: number;
  month?: number;
  trimester?: number;
  semester?: number;
  type: PerimeterType; //type de territoire selectionné
  observe: PerimeterType; //type du territoire observé
  code: INSEECode; //code insee du territoire observé
  limit?: number;
}

export const handlerConfig = {
  service: "observatory",
  method: "getBestTerritories",
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
