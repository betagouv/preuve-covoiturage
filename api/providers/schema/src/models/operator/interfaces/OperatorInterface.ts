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
  bank?: BankInterface;
  contacts?: ContactsInterface;
  cgu?: CguInterface;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
