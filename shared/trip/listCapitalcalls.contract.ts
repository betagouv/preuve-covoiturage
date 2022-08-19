export type ResultInterface = S3Object[];

export interface S3Object {
  key?: string;
  signed_url: string;
  size?: number;
}

export interface ParamsInterface {
  operator_id?: number;
  territory_id?: number;
}

export const handlerConfig = {
  service: 'capitalcall',
  method: 'list',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
