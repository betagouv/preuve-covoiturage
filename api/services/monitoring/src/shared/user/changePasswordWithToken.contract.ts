export interface ParamsInterface {
  email: string;
  password: string;
  token: string;
}

export type ResultInterface = boolean;

export const handlerConfig = {
  service: 'user',
  method: 'changePasswordWithToken',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
