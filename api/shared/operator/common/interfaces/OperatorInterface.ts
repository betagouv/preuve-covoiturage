import { CompanyInterface } from '../../../common/interfaces/CompanyInterface';
import { AddressInterface } from '../../../common/interfaces/AddressInterface';
import { BankInterface } from '../../../common/interfaces/BankInterface';
import { ContactsInterface } from '../../../common/interfaces/ContactsInterface';
import { CguInterface } from '../../../common/interfaces/CguInterface';

export interface OperatorInterface {
  name: string;
  legal_name: string;
  siret: string;
  company?: CompanyInterface;
  address?: AddressInterface;
  bank?: BankInterface;
  contacts?: ContactsInterface;
  cgu?: CguInterface;
}
