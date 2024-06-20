import { ContactsInterface } from '../common/interfaces/ContactsInterface.ts';
import { TerritoryGroupInterface } from './common/interfaces/TerritoryInterface.ts';

export interface ParamsInterface {
  _id: number;
  patch: Partial<ContactsInterface>;
}
export interface ResultInterface extends TerritoryGroupInterface {}

export const handlerConfig = {
  service: 'territory',
  method: 'patchContacts',
} as const;
export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
