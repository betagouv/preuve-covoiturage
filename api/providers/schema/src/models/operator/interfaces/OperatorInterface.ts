import { CompanyInterface } from '../../company';
import { AddressInterface } from '../../address';
import { BankInterface } from '../../bank';
import { ContactsInterface } from '../../contacts';
import { CguInterface } from '../../cgu';

export interface OperatorInterface {
  _id?: string;
  nom_commercial: string;
  raison_sociale: string;
  company?: CompanyInterface;
  address?: AddressInterface;
  siret?: string;
  bank?: BankInterface;
  contacts?: ContactsInterface;
  cgu?: CguInterface;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}
