import { AcquisitionErrorInterface } from './common/interfaces/AcquisitionErrorInterface';

export interface ParamsInterface {
  journey_id: string;
  operator_id?: number;
}

export interface ResultInterface extends AcquisitionErrorInterface {}

export const handlerConfig = {
  service: 'acquisition',
  method: 'finderrors',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
