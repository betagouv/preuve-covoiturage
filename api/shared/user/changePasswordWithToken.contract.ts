export interface ParamsInterface {
  email: string;
  password: string;
  forgotten_token: string;
}

export type ResultInterface = boolean;

export const configHandler = {
  service: 'user',
  method: 'changePasswordWithToken',
};

export const signature = `${configHandler.service}:${configHandler.method}`;
