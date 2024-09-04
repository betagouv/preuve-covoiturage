export interface ParamsInterface<T = unknown> {
  template: string;
  to: string;
  data: T;
}

export type ResultInterface = void;

export const handlerConfig = {
  service: "user",
  method: "notify",
} as const;

export const signature =
  `${handlerConfig.service}:${handlerConfig.method}` as const;
