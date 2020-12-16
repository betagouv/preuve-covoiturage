export interface ParamsInterface {
  _id: number;
  thumbnail?: boolean;
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
