import { CompanyInterface } from '../../../common/interfaces/CompanyInterface';
import { AddressInterface } from '../../../common/interfaces/AddressInterface';
import { ContactsInterface } from '../../../common/interfaces/ContactsInterface';

export interface TerritoryInterface {
  parent_id?: number;

  siret: string;
  name: string;
  shortname?: string;

  insee?: string[];

  company?: CompanyInterface;
  address?: AddressInterface;
  contacts?: ContactsInterface;

  cgu_accepted_by?: number;
  cgu_accepted_at?: Date;
}
