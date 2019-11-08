export interface ParamsInterface {
  email: string;
  token: string;
}

export type ResultInterface = boolean;

export const handlerConfig = {
  service: 'user',
  method: 'checkForgottenToken',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
