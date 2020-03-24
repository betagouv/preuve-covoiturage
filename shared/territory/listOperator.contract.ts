export interface ParamsInterface {
  operator_id?: number;
  territory_id?: number;
}

export type ResultInterface = number[];

export const configHandler = {
  service: 'territory',
  method: 'listOperator',
};

export const signature = `${configHandler.service}:${configHandler.method}`;
