export interface ParamsInterface {
  uuid: string;
}

export type ResultInterface = void;

export const handlerConfig = {
  service: "cee",
  method: "deleteCeeApplication",
} as const;

export const signature =
  `${handlerConfig.service}:${handlerConfig.method}` as const;
