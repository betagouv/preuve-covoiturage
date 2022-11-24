export interface ParamsInterface {
  territory_insee: string;
  policy_template_id: 1 | 2;
}

export interface ResultInterface {
  amount: number;
  trip_subsidized: number;
}

export const handlerConfig = {
  service: 'campaign',
  method: 'simulateOnPastGeo',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
