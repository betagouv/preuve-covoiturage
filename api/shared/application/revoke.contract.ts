export interface ParamsInterface {
  _id: string;
}

export type ResultInterface = void;

export const handlerConfig = {
  service: 'application',
  method: 'revoke',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
