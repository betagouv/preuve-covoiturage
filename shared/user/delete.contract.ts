export interface ParamsInterface {
  _id: number;
  territory_id?: number;
  operator_id?: number;
}

export type ResultInterface = boolean;

export const handlerConfig = {
  service: 'user',
  method: 'delete',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
