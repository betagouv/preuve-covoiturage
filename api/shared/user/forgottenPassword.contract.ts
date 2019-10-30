export interface ParamsInterface {
  email: string;
}

export type ResultInterface = boolean;

export const configHandler = {
  service: 'user',
  method: 'forgottenPassword',
};

export const signature = `${configHandler.service}:${configHandler.method}`;
