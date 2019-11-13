import { OperatorInterface } from './common/interfaces/OperatorInterface';

export interface ParamsInterface {
  _id: number;
  patch: OperatorInterface;
}

export interface ResultInterface extends OperatorInterface {}

export const handlerConfig = {
  service: 'operator',
  method: 'patch',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
