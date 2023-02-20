export interface ParamsInterface {
  _id: number;
  thumbnail: string;
}

export interface ResultInterface extends ParamsInterface {}

export const handlerConfig = {
  service: 'operator',
  method: 'patchThumbnail',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
