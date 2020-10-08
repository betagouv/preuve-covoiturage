export type ParamsInterface = void;

export type ResultInterface = {
  operators: number[];
  territories: number[];
};

export const handlerConfig = {
  service: 'user',
  method: 'hasUsers',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
