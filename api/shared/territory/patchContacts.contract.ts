import { TerritoryInterface } from './common/interfaces/TerritoryInterface';
import { ContactsInterface } from '../common/interfaces/ContactsInterface';

interface Territory extends TerritoryInterface {
  _id: number;
}

export interface ParamsInterface {
  _id: number;
  patch: Partial<ContactsInterface>;
}
export interface ResultInterface extends Territory {}
export const configHandler = {
  service: 'territory',
  method: 'patchContacts',
};
export const signature = `${configHandler.service}:${configHandler.method}`;
