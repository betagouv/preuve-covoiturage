export type ParamsInterface = { campaigns?: number[] };
export type ResultInterface = void;

export const handlerConfig = {
  service: 'campaign',
  method: 'syncmaxamount',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
