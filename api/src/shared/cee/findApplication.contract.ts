import { CeeApplicationResultInterface } from "./common/CeeApplicationInterface.ts";

export interface ParamsInterface {
  uuid: string;
}

export type ResultInterface = CeeApplicationResultInterface;

export const handlerConfig = {
  service: "cee",
  method: "findCeeApplication",
} as const;

export const signature =
  `${handlerConfig.service}:${handlerConfig.method}` as const;
