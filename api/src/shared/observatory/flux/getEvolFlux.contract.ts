import {
  IndicType,
  INSEECode,
  PerimeterLabel,
  PerimeterType,
} from "@/shared/geo/shared/Perimeter.ts";

export interface SingleResultInterface {
  territory: INSEECode;
  l_territory: PerimeterLabel;
  journeys?: number;
  passengers?: number;
  has_incentive?: number;
  distance?: number;
  duration?: number;
}

export type ResultInterface = SingleResultInterface[];

export interface ParamsInterface {
  year: number;
  month?: number;
  trimester?: number;
  semester?: number;
  type: PerimeterType; //type de territoire selectionné
  code: INSEECode; //code insee du territoire observé
  indic: IndicType;
  past?: string;
}

export const handlerConfig = {
  service: "observatory",
  method: "getEvolFlux",
};

export const signature =
  `${handlerConfig.service}:${handlerConfig.method}` as const;
