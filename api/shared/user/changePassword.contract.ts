export interface ParamsInterface {
  _id: number;
  old_password: string;
  new_password: string;
}

export type ResultInterface = boolean;

export const configHandler = {
  service: 'user',
  method: 'changePassword',
};

export const signature = `${configHandler.service}:${configHandler.method}`;
