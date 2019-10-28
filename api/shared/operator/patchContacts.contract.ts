import { OperatorInterface } from './common/interfaces/OperatorInterface';

export interface ParamsInterface {
  _id: string;
  patch: OperatorInterface;
}

export interface ResultInterface extends OperatorInterface {}

export const handlerConfig = {
  service: 'operator',
  method: 'patchContacts',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
