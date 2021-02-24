export interface ParamsInterface {
  _id: number;
  thumbnail: string;
}

export interface ResultInterface extends ParamsInterface {}

export const handlerConfig = {
  service: 'operator',
  method: 'patchThumbnail',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
