export interface ParamsInterface {
  old_password: string;
  new_password: string;
  _id: number;
}

export type ResultInterface = boolean;

export const handlerConfig = {
  service: 'user',
  method: 'changePassword',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
