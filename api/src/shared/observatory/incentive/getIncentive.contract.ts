import {
  Direction,
  INSEECode,
  PerimeterLabel,
  PerimeterType,
} from "@/shared/geo/shared/Perimeter.ts";

export interface SingleResultInterface {
  code: INSEECode;
  libelle: PerimeterLabel;
  direction: Direction;
  collectivite: number;
  operateur: number;
  autres: number;
}

export type ResultInterface = SingleResultInterface[];

export interface ParamsInterface {
  year: number;
  month?: number;
  trimester?: number;
  semester?: number;
  type: PerimeterType; //type de territoire selectionné
  code: INSEECode; //code insee du territoire selectionné
  direction?: Direction;
}

export const handlerConfig = {
  service: "observatory",
  method: "getIncentive",
};

export const signature =
  `${handlerConfig.service}:${handlerConfig.method}` as const;
