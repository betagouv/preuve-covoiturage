export interface ParamsInterface {
  email: string;
  token: string;
}

export type ResultInterface = boolean;

export const configHandler = {
  service: 'user',
  method: 'checkForgottenToken',
};

export const signature = `${configHandler.service}:${configHandler.method}`;
