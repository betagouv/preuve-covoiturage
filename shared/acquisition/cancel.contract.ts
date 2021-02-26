export interface ParamsInterface {
  journey_id: string;
  operator_id: number;
}

export type ResultInterface = void;
export const handlerConfig = {
  service: 'acquisition',
  method: 'cancel',
};
export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
