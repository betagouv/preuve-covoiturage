export interface ParamsInterface {
  _id: number;
  role: string;
}

export type ResultInterface = boolean;

export const handlerConfig = {
  service: 'user',
  method: 'changeRole',
};

// TODO: remove

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
