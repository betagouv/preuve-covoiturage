export interface ParamsInterface {
  territory_id: number;
  name: string;
  handler: string;
  months?: number;
}

export interface ResultInterface {
  amount: number;
  trip_subsidized: number;
  start_date: Date;
  end_date: Date;
}

export const handlerConfig = {
  service: 'campaign',
  method: 'simulateOnPast',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
