export interface ParamsInterface {
  uuid: string;
  type: string;
}

export type ResultInterface = Buffer;

export const handlerConfig = {
  service: 'certificate',
  method: 'download',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
