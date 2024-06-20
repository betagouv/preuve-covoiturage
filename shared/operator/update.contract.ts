import { OperatorInterface } from './common/interfaces/OperatorInterface';
import { OperatorDbInterface } from './common/interfaces/OperatorDbInterface';

export interface ParamsInterface extends OperatorInterface {
  _id: number;
}
export interface ResultInterface extends OperatorDbInterface {}

export const handlerConfig = {
  service: 'operator',
  method: 'update',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
