import { AcquisitionInterface } from '../acquisition/common/interfaces/AcquisitionInterface';
import { PositionInterface } from '../common/interfaces/PositionInterface';

export type ResultInterface = {
  start: number;
  end: number;
};
export interface ParamsInterface {
  start: PositionInterface;
  end: PositionInterface;
}
export const handlerConfig = {
  service: 'normalization',
  method: 'territory',
};
export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
