export interface ParamsInterface {
  _id: number;
}

export type ResultInterface = boolean;

export const handlerConfig = {
  service: 'user',
  method: 'delete',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
