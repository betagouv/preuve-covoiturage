export interface ParamsInterface {
  acquisition_id: number;
  status: string;
}

export type ResultInterface = void;

export const handlerConfig = {
  service: 'carpool',
  method: 'updateStatus',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
