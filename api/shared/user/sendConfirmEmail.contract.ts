export interface ParamsInterface {
  _id: string;
}

export type ResultInterface = boolean;

export const configHandler = {
  service: 'user',
  method: 'sendConfirmEmail',
};

export const signature = `${configHandler.service}:${configHandler.method}`;
