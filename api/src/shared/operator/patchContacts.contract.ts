import { OperatorInterface } from './common/interfaces/OperatorInterface.ts';
import { ContactsInterface } from '../common/interfaces/ContactsInterface.ts';

export interface ParamsInterface {
  _id: number;
  patch: Partial<ContactsInterface>;
}

export interface ResultInterface extends OperatorInterface {}

export const handlerConfig = {
  service: 'operator',
  method: 'patchContacts',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
