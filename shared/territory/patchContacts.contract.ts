import { ContactsInterface } from '../common/interfaces/ContactsInterface';
import { TerritoryInterface } from './common/interfaces/TerritoryInterface';

export interface ParamsInterface {
  _id: number;
  patch: Partial<ContactsInterface>;
}
export interface ResultInterface extends TerritoryInterface {}
export const handlerConfig = {
  service: 'territory',
  method: 'patchContacts',
};
export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
