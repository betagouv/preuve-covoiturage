export interface ParamsInterface {
  journey_id: string;
}

export type ResultInterface = void;
export const handlerConfig = {
  service: 'acquisition',
  method: 'cancel',
};
export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
