export interface ParamsInterface {
  _id: number;
}
export type ResultInterface = void;

export const handlerConfig = {
  service: 'carpool',
  method: 'dispatch',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
