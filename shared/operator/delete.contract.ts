export interface ParamsInterface {
  _id: number;
}

export type ResultInterface = boolean;

export const handlerConfig = {
  service: 'operator',
  method: 'delete',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
