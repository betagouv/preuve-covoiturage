import { AddressInterface } from "../../../../../../shared/common/interfaces/AddressInterface.ts";
import { BankInterface } from "../../../../../../shared/common/interfaces/BankInterface.ts";
import { CompanyInterface } from "../../../../../../shared/common/interfaces/CompanyInterface.ts";
import { ContactsInterface } from "../../../../../../shared/common/interfaces/ContactsInterface.ts";

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
