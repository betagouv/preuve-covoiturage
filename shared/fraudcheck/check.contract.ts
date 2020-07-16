export interface ParamsInterface {
  acquisition_id: number;
}

export type ResultInterface = void;

export const handlerConfig = {
  service: 'fraudcheck',
  method: 'check',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
