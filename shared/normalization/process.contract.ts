import { AcquisitionInterface } from '../acquisition/common/interfaces/AcquisitionInterface';
import { ParamsInterface as CrossCheckParamsInterface } from '../carpool/crosscheck.contract';

export type ResultInterface = CrossCheckParamsInterface;
export interface ParamsInterface extends AcquisitionInterface {}
export const handlerConfig = {
  service: 'normalization',
  method: 'process',
};
export const signature = `${handlerConfig.service}:${handlerConfig.method}`;

export const defaultQueueMeta = {};
