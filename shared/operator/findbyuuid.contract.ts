export interface ParamsInterface {
  uuid: string[];
}

export type ResultInterface = Array<{
  _id: number;
  uuid: string;
}>;

export const handlerConfig = {
  service: 'operator',
  method: 'findbyuuid',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
