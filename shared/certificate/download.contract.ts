export interface ParamsInterface {
  uuid: string;
  type: string;
}

// should be Buffer but fails with the frontend
export type ResultInterface = any;

export const handlerConfig = {
  service: 'certificate',
  method: 'download',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
