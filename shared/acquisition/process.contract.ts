export interface ParamsInterface {}
export type ResultInterface = void;
export const handlerConfig = {
  service: 'acquisition',
  method: 'process',
};
export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
