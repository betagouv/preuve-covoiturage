import { CompanyInterface } from '../../../common/interfaces/CompanyInterface';
import { AddressInterface } from '../../../common/interfaces/AddressInterface';
import { BankInterface } from '../../../common/interfaces/BankInterface';
import { ContactsInterface } from '../../../common/interfaces/ContactsInterface';
import { CguInterface } from '../../../common/interfaces/CguInterface';

export interface OperatorInterface {
  _id?: string;
  nom_commercial: string;
  raison_sociale: string;
  company?: CompanyInterface;
  address?: AddressInterface;
  bank?: BankInterface;
  contacts?: ContactsInterface;
  cgu?: CguInterface;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}
