export interface ParamsInterface {
  territory_id: number;
  name: string;
  handler: string;
  months?: number;
  // start_date: Date;
  // end_date: Date;
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
