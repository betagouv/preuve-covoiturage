export type ParamsInterface = void;

export type ResultInterface = void;

export const handlerConfig = {
  service: 'fraudcheck',
  method: 'apply',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
