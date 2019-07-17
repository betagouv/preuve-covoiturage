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
  insee_main?: string;
  network_id?: number;

  company?: CompanyInterface;
  address?: AddressInterface;
  contacts?: ContactsInterface;
  cgu?: CguInterface;

  geometry?: {
    type: string;
    coordinates: any[];
  };

  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}
