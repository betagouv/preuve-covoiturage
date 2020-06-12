export interface ParamsInterface {
  uuid: string;
  type: 'pdf' | 'png'; // PrintTypes from @pdc/provider-printer
}

// should be Buffer but fails with the frontend
export type ResultInterface = any;

export const handlerConfig = {
  service: 'certificate',
  method: 'download',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
