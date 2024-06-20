import { CompanyInterface } from '../../../common/interfaces/CompanyInterface.ts';
import { AddressInterface } from '../../../common/interfaces/AddressInterface.ts';
import { BankInterface } from '../../../common/interfaces/BankInterface.ts';
import { ContactsInterface } from '../../../common/interfaces/ContactsInterface.ts';

export interface OperatorInterface {
  name: string;
  legal_name: string;
  siret: string;
  uuid: string;
  company?: CompanyInterface;
  address?: AddressInterface;
  bank?: BankInterface;
  contacts?: ContactsInterface;
  thumbnail?: string;
  cgu_accepted_at?: Date;
  cgu_accepted_by?: number;
}
