export type ResultInterface = {};

export interface ParamsInterface {
  operator_id?: number;
  territory_id?: number;
}

export const handlerConfig = {
  service: 'capitalcall',
  method: 'list',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
