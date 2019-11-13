export interface ParamsInterface {
  _id: number;
}

export type ResultInterface = boolean;

export const configHandler = {
  service: 'user',
  method: 'delete',
};

export const signature = `${configHandler.service}:${configHandler.method}`;
