export type ParamsInterface = void;

export type ResultInterface = void;

export const handlerConfig = {
  service: 'observatory',
  method: 'insertLastMonthDistribution',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;