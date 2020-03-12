export interface ParamsInterface {
  journey_id: string;
}

export interface ResultInterface {
  journey_id: string;
  status: string;
  metadata?: object;
}

export const handlerConfig = {
  service: 'acquisition',
  method: 'status',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
