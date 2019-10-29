import { CompanyInterface } from '../../../common/interfaces/CompanyInterface';
import { AddressInterface } from '../../../common/interfaces/AddressInterface';
import { ContactsInterface } from '../../../common/interfaces/ContactsInterface';
import { CguInterface } from '../../../common/interfaces/CguInterface';

export interface TerritoryInterface {
  name?: string;
  shortname?: string;
  acronym?: string;
  insee?: string[];

  company?: CompanyInterface;
  address?: AddressInterface;
  contacts?: ContactsInterface;
  cgu?: CguInterface;

  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}
