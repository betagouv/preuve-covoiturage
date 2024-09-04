export interface ParamsInterface extends SimulateOnPastGeoRequiredParams {
  months?: number;
}

export interface SimulateOnPastGeoRequiredParams {
  territory_insee: string;
  policy_template_id: '1' | '2' | '3';
}

export interface ResultInterface {
  amount: number;
  trip_subsidized: number;
}

export const handlerConfig = {
  service: 'campaign',
  method: 'simulateOnPastGeo',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
