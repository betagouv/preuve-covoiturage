import { OperatorInterface } from './common/interfaces/OperatorInterface';

export interface ParamsInterface {
  _id: string;
}

export interface ResultInterface extends OperatorInterface {}

export const handlerConfig = {
  service: 'operator',
  method: 'find',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
