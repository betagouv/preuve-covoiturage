import { CompanyInterface } from '../../company';
import { AddressInterface } from '../../address';
import { ContactsInterface } from '../../contacts';
import { CguInterface } from '../../cgu';

export interface TerritoryInterface {
  _id?: string;
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
