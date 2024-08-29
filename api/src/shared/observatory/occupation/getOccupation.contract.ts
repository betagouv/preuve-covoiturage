import {
  Direction,
  INSEECode,
  PerimeterLabel,
  PerimeterType,
} from "@/shared/geo/shared/Perimeter.ts";
import type { Feature } from "../../geo/GeoJson.ts";

export interface SingleResultInterface {
  code: INSEECode;
  libelle: PerimeterLabel;
  journeys: number;
  has_incentive?: number;
  occupation_rate: number;
  geom: Feature;
}

export type ResultInterface = SingleResultInterface[];

export interface ParamsInterface {
  year: number;
  month?: number;
  trimester?: number;
  semester?: number;
  type: PerimeterType; //type de territoire selectionné
  code: INSEECode; //code insee du territoire selectionné
  observe: PerimeterType; //type du territoire observé
  direction: Direction;
}

export const handlerConfig = {
  service: "observatory",
  method: "getOccupation",
};

export const signature =
  `${handlerConfig.service}:${handlerConfig.method}` as const;
