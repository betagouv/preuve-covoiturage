export type ParamsInterface = void;
export type ResultInterface = any;

export const handlerConfig = {
  service: 'trip',
  method: 'publicStats',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
