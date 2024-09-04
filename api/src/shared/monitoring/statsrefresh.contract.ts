export type ParamsInterface = { schema: string };
export type ResultInterface = void;

export const handlerConfig = {
  service: 'monitoring',
  method: 'statsrefresh',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
