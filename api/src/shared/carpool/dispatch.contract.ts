export interface ParamsInterface {
  _id: number;
}
export type ResultInterface = void;

export const handlerConfig = {
  service: 'carpool',
  method: 'dispatch',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
