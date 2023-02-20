export interface ParamsInterface {
  last_hours?: number;
}

export type ResultInterface = void;

export const handlerConfig = {
  service: 'fraudcheck',
  method: 'checkPending',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
