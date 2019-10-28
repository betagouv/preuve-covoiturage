export interface ParamsInterface {
  _id: string;
  territory_id: string;
}
export type ResultInterface = boolean;

export const handlerConfig = {
  service: 'campaign',
  method: 'delete',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
