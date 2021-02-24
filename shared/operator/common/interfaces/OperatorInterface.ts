import { CompanyInterface } from '../../../common/interfaces/CompanyInterface';
import { AddressInterface } from '../../../common/interfaces/AddressInterface';
import { BankInterface } from '../../../common/interfaces/BankInterface';
import { ContactsInterface } from '../../../common/interfaces/ContactsInterface';

export interface OperatorInterface {
  name: string;
  legal_name: string;
  siret: string;
  company?: CompanyInterface;
  address?: AddressInterface;
  bank?: BankInterface;
  contacts?: ContactsInterface;
  thumbnail?: string;
  cgu_accepted_at?: Date;
  cgu_accepted_by?: number;
}
