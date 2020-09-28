export type ParamsInterface = void;
export type ResultInterface = void;

export const handlerConfig = {
  service: 'trip',
  method: 'cacheWarmCron',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
