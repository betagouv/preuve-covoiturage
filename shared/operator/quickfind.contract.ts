export interface ParamsInterface {
  _id: number;
}

export interface ResultInterface {
  uuid: string;
  name: string;
}

export const handlerConfig = {
  service: 'operator',
  method: 'quickfind',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
