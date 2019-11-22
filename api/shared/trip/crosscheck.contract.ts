import { AcquisitionInterface } from '../acquisition/common/interfaces/AcquisitionInterface';

export interface ParamsInterface extends AcquisitionInterface {}
export type ResultInterface = void;

export const handlerConfig = {
  service: 'trip',
  method: 'crosscheck',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
