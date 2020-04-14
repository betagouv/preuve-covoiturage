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

export interface TerritoryBaseInterface {
  level: TerritoryLevelEnum;
  name: string;
  company_id?: number;
  active?: boolean;
  active_since?: Date;
  contacts?: ContactsInterface;
  density?: number;
  geo?: any; // TODO : geography type
}
