export interface ParamsInterface {
  acquisition_id: number;
}

export type ResultInterface = void;

export const handlerConfig = {
  service: 'fraudcheck',
  method: 'checkOne',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
