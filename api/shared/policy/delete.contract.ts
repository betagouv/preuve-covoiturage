export interface ParamsInterface {
  _id: number;
  territory_id: number;
}
export type ResultInterface = boolean;

export const handlerConfig = {
  service: 'campaign',
  method: 'delete',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
