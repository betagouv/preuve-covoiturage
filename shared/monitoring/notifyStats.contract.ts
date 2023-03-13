export type ParamsInterface = void;

export type ResultInterface = void;

export const handlerConfig = {
  service: 'monitoring',
  method: 'journeysStatsNotify',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
