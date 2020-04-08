export type ParamsInterface = void;

export type ResultInterface = void;

export const handlerConfig = {
  service: 'campaign',
  method: 'finalize',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
