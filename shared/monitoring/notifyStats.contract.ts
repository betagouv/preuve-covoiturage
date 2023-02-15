export type ParamsInterface = void;

export type ResultInterface = void;

export const handlerConfig = {
  service: 'monitoring',
  method: 'journeysStatsNotify',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
