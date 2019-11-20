import { AcquisitionInterface } from '../acquisition/common/interfaces/AcquisitionInterface';

export interface ParamsInterface extends AcquisitionInterface {}
export type ResultInterface = void;

export const handlerConfig = {
  service: 'carpool',
  method: 'crosscheck',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
