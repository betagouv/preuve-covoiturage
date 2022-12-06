export type ParamsInterface = void;

export type ResultInterface = void;

export const handlerConfig = {
  service: 'observatory',
  method: 'insertLastMonthOccupation',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;