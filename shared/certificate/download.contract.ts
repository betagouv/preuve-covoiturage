import { PrintTypes } from '@pdc/provider-printer';

export interface ParamsInterface {
  uuid: string;
  type: PrintTypes;
}

// should be Buffer but fails with the frontend
export type ResultInterface = any;

export const handlerConfig = {
  service: 'certificate',
  method: 'download',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
