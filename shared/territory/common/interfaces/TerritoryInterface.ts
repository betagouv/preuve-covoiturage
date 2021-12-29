import { ContactsInterface } from '../../../common/interfaces/ContactsInterface';
import { TerritoryDbMetaInterface } from './TerritoryDbMetaInterface';

export enum TerritoryLevelEnum {
  Town = 'town',
  Towngroup = 'towngroup',
  District = 'district',
  Megalopolis = 'megalopolis',
  Region = 'region',
  State = 'state',
  Country = 'country',
  Countrygroup = 'countrygroup',
  Other = 'other',
}

export interface TerritoryAddress {
  street: string;
  postcode: string;
  cedex?: string;
  city: string;
  country: string;
}

export interface TerritoryBaseInterface {
  level: TerritoryLevelEnum | string;
  name: string;
  company_id?: number;
  children: number[];
  contacts?: ContactsInterface;
  address: TerritoryAddress;
}

export interface TerritoryInterface extends TerritoryBaseInterface {
  _id: number;
}
