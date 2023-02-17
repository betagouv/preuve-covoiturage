export type ParamsInterface = 'export' | 'list';
export type ResultInterface = void;

export const handlerConfig = {
  service: 'trip',
  method: 'refresh',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
