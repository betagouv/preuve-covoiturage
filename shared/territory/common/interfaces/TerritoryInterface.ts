import { ContactsInterface } from '../../../common/interfaces/ContactsInterface';
import { TerritorySelectorsInterface } from './TerritoryCodeInterface';

export interface TerritoryGroupInterface {
  _id: number;
  company_id: number;
  name: string;
  shortname: string;
  contacts: ContactsInterface;
  address: TerritoryAddress;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
  selector?: TerritorySelectorsInterface;
}

export type CreateTerritoryGroupInterface = Omit<
  TerritoryGroupInterface,
  '_id' | 'created_at' | 'updated_at' | 'deleted_at' | 'shortname'
>;
export type UpdateTerritoryGroupInterface = Omit<
  TerritoryGroupInterface,
  'created_at' | 'updated_at' | 'deleted_at' | 'shortname'
>;

// OLD INTERFACES
// TODO : DROP THIS
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
  parent: number;
  children: number[];
  contacts?: ContactsInterface;
  address: TerritoryAddress;
}

export interface TerritoryInterface extends TerritoryBaseInterface {
  _id: number;
}
