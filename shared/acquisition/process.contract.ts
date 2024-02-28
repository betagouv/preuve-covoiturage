export type ParamsInterface = void;
export type ResultInterface = boolean;
export const handlerConfig = {
  service: 'acquisition',
  method: 'process',
} as const;
export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
