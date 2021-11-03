export interface ParamsInterface {
  filepath: string;
}

export type ResultInterface = void;

export const handlerConfig = {
  service: 'trip',
  method: 'publishOpenData',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
