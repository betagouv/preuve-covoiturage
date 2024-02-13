export type ParamsInterface = void;
export type ResultInterface = void;
export const handlerConfig = {
  service: 'acquisition',
  method: 'process',
} as const;
export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
