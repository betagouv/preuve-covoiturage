export interface ParamsInterface {
  journey_id: string;
  operator_id: number;
  error_stage: string;
}

export type ResultInterface = number;

export const handlerConfig = {
  service: 'acquisition',
  method: 'resolveerror',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
