export interface ParamsInterface {
  operator_id: number;
  territory_id: number[];
}

export type ResultInterface = void;

export const configHandler = {
  service: 'territory',
  method: 'updateOperator',
};
export const signature = `${configHandler.service}:${configHandler.method}`;
