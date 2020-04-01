export interface ParamsInterface {
  acquisition_id: number;
  operator_id: number;
  journey_id: string;
}

export type ResultInterface = 'ok' | 'expired' | 'canceled';

export const handlerConfig = {
  service: 'acquisition',
  method: 'carpoolstatus',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
