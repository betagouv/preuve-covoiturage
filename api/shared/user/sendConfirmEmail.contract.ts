export interface ParamsInterface {
  _id: number;
}

export type ResultInterface = boolean;

export const handlerConfig = {
  service: 'user',
  method: 'sendConfirmEmail',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
