import { CompanyInterface } from '../../../common/interfaces/CompanyInterface';
import { AddressInterface } from '../../../common/interfaces/AddressInterface';
import { BankInterface } from '../../../common/interfaces/BankInterface';
import { ContactsInterface } from '../../../common/interfaces/ContactsInterface';
import { OperatorMetaInterface } from '../../common/interfaces/OperatorMetaInterface';

export interface OperatorInterface {
  name: string;
  legal_name: string;
  siret: string;
  company?: CompanyInterface;
  address?: AddressInterface;
  bank?: BankInterface;
  meta?: OperatorMetaInterface;
  contacts?: ContactsInterface;
  cgu_accepted_at?: Date;
  cgu_accepted_by?: number;
}
