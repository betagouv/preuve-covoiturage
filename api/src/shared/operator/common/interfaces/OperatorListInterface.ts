import { CompanyInterface } from '../../../common/interfaces/CompanyInterface.ts';
import { AddressInterface } from '../../../common/interfaces/AddressInterface.ts';

export interface OperatorListInterface {
  _id: number;
  uuid: string;
  name: string;
  legal_name: string;
  siret: string;
  company?: CompanyInterface;
  address?: AddressInterface;
  cgu_accepted_at: Date;
  cgu_accepted_by: number;
  created_at: Date;
  updated_at: Date;
}
