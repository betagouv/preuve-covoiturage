export interface ParamsInterface {
  contentType: string;
}

export type ResultInterface = void;

export const handlerConfig = {
  service: 'operator',
  method: 'getuploadurl',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
