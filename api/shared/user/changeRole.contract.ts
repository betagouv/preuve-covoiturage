export interface ParamsInterface {
  _id: string;
  role: string;
}

export type ResultInterface = boolean;

export const configHandler = {
  service: 'user',
  method: 'changeRole',
};

// TODO: remove

export const signature = `${configHandler.service}:${configHandler.method}`;
