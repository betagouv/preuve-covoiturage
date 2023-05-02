export interface ParamsInterface {
  operator_journey_id: string;
  operator_id: number;
}

export type ResultInterface = void;
export const handlerConfig = {
  service: 'acquisition',
  method: 'cancel',
} as const;
export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
