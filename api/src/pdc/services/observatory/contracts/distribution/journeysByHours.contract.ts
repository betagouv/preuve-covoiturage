import { Direction, INSEECode, PerimeterLabel, PerimeterType } from "@/pdc/services/geo/contracts/shared/Perimeter.ts";

export interface SingleResultInterface {
  code: INSEECode;
  libelle: PerimeterLabel;
  direction: Direction;
  hours: [
    {
      hour: number;
      journeys: number;
    },
  ];
}

export type ResultInterface = SingleResultInterface[];

export interface ParamsInterface {
  year: number;
  month?: number;
  trimester?: number;
  semester?: number;
  type: PerimeterType; //type de territoire selectionné
  code: INSEECode; //code insee du territoire observé
  direction?: Direction;
}

export const handlerConfig = {
  service: "observatory",
  method: "journeysByHours",
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
