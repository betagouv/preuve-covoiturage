export type ParamsInterface = string;

export type ResultInterface = void;

export const handlerConfig = {
  service: 'company',
  method: 'fetch',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
