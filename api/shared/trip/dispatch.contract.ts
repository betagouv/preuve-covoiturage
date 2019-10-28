export interface ParamsInterface {
  _id: string;
}
export type ResultInterface = void;

export const handlerConfig = {
  service: 'trip',
  method: 'dispatch',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
