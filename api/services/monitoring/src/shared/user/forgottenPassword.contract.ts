export interface ParamsInterface {
  email: string;
}

export type ResultInterface = boolean;

export const handlerConfig = {
  service: 'user',
  method: 'forgottenPassword',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
