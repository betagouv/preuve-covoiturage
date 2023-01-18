export interface ParamsInterface {
  territory_id: number;
  name: string;
  start_date: Date;
  end_date: Date;
  handler: string;
}

export interface ResultInterface {
  amount: number;
  trip_subsidized: number;
}

export const handlerConfig = {
  service: 'campaign',
  method: 'simulateOnPast',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
