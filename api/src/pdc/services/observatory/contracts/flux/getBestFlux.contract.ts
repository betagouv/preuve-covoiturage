import { INSEECode, PerimeterLabel, PerimeterType } from "@/pdc/services/geo/contracts/shared/Perimeter.ts";

export interface SingleResultInterface {
  territory_1: INSEECode;
  l_territory_1: PerimeterLabel;
  territory_2: INSEECode;
  l_territory_2: PerimeterLabel;
  journeys: number;
}

export type ResultInterface = SingleResultInterface[];

export interface ParamsInterface {
  year: number;
  month?: number;
  trimester?: number;
  semester?: number;
  type: PerimeterType; //type de territoire selectionné
  code: INSEECode; //code insee du territoire observé
  limit?: number; //Nb de résultats
}

export const handlerConfig = {
  service: "observatory",
  method: "getBestFlux",
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
