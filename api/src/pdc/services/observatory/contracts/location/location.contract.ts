import { INSEECode, PerimeterType } from "../../../../../shared/geo/shared/Perimeter.ts";

export interface SingleSqlResultInterface {
  lon: number;
  lat: number;
}

export type SqlResultInterface = SingleSqlResultInterface[];

export interface SingleResultInterface {
  hex: string;
  count: number;
}

export type ResultInterface = SingleResultInterface[];

export interface ParamsInterface {
  year: number;
  month?: number;
  trimester?: number;
  semester?: number;
  type: PerimeterType; //type de territoire observé
  code: INSEECode; //code insee du territoire observé
  zoom: number;
}

export const handlerConfig = {
  service: "observatory",
  method: "getLocation",
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
