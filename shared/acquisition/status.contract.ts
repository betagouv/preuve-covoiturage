export interface ParamsInterface {
  journey_id: string;
  operator_id: number;
}

export interface ResultInterface {
  journey_id: string;
  status: string;
  created_at: Date;
  metadata?: object;
}

export const handlerConfig = {
  service: 'acquisition',
  method: 'status',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
