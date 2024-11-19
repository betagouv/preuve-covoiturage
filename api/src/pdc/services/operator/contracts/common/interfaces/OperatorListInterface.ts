import { AddressInterface } from "../../../../../../shared/common/interfaces/AddressInterface.ts";
import { CompanyInterface } from "../../../../../../shared/common/interfaces/CompanyInterface.ts";

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
