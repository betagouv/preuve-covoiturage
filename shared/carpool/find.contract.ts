import { CarpoolInterface } from './interfaces/CarpoolInterface';

export interface ParamsInterface {
  acquisition_id: number;
}

export type ResultInterface = CarpoolInterface;

export const handlerConfig = {
  service: 'carpool',
  method: 'find',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
