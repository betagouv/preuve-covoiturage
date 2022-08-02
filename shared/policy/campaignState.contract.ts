export interface ParamsInterface {
  _id: number;
}
export interface ResultInterface {
  amount: number;
  trip_subsidized: number;
  trip_excluded: number;
}

export const handlerConfig = {
  service: 'campaign',
  method: 'state',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
