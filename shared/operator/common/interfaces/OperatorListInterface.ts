import { CompanyInterface } from '../../../common/interfaces/CompanyInterface';
import { AddressInterface } from '../../../common/interfaces/AddressInterface';
import { OperatorMetaInterface } from './OperatorMetaInterface';

export interface OperatorListInterface {
  _id: number;
  uuid: string;
  name: string;
  legal_name: string;
  siret: string;
  company?: CompanyInterface;
  address?: AddressInterface;
  meta: OperatorMetaInterface;
  cgu_accepted_at: Date;
  cgu_accepted_by: number;
  created_at: Date;
  updated_at: Date;
}
