export interface ParamsInterface {
  email: string;
  forgotten_token: string;
}

export type ResultInterface = boolean;

export const configHandler = {
  service: 'user',
  method: 'confirmEmail',
};

export const signature = `${configHandler.service}:${configHandler.method}`;
