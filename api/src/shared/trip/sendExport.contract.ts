import { TerritorySelectorsInterface } from "../territory/common/interfaces/TerritoryCodeInterface.ts";

export interface ParamsInterface {
  format: {
    tz: string;
  };
  query: {
    date: {
      start: Date;
      end: Date;
    };
    territory_authorized_operator_id?: number[]; // territory id for operator visibility filtering
    operator_id?: number[];
    geo_selector?: TerritorySelectorsInterface;
  };
  type?: ExportType;
  from: {
    type?: string;
    email: string;
    fullname: string;
  };
}

export const ExportTypeList = [
  "opendata",
  "export",
  "registry",
  "operator",
  "territory",
] as const;
export type ExportType = typeof ExportTypeList[number];

export type ResultInterface = undefined;

export const handlerConfig = {
  service: "trip",
  method: "sendExport",
} as const;

export const signature =
  `${handlerConfig.service}:${handlerConfig.method}` as const;
