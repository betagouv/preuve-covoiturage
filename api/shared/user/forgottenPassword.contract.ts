export interface ParamsInterface {
  email: string;
}

export type ResultInterface = void;

export const configHandler = {
  service: 'user',
  method: 'forgottenPassword',
};

export const signature = `${configHandler.service}:${configHandler.method}`;
