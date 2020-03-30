export interface ParamsInterface {
  acquisition_id: number;
  status: string;
}

export type ResultInterface = void;

export const handlerConfig = {
  service: 'carpool',
  method: 'updateStatus',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
