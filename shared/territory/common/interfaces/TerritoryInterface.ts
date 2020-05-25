import { ContactsInterface } from '../../../common/interfaces/ContactsInterface';

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
  shortname?: string;
  company_id?: number;
  active?: boolean;
  active_since?: Date;
  contacts?: ContactsInterface;
  density?: number;
  address: TerritoryAddress;
  geo?: any; // TODO : geography type
}
