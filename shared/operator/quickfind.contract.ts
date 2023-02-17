export interface ParamsInterface {
  _id: number;
  thumbnail?: boolean;
}

export interface ResultInterface {
  uuid: string;
  name: string;
  support: string;
  thumbnail?: string;
}

export const handlerConfig = {
  service: 'operator',
  method: 'quickfind',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
