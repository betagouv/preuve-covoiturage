export interface ParamsInterface {
  _id: number;
  role: string;
  operator_id?: number;
  territory_id?: number;
}

export type ResultInterface = boolean;

export const handlerConfig = {
  service: 'user',
  method: 'changeRole',
} as const;

// TODO: remove

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
