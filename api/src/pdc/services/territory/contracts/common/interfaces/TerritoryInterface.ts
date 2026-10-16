import { ContactsInterface } from "@/shared/common/interfaces/ContactsInterface.ts";
import { TerritorySelectorsInterface } from "./TerritoryCodeInterface.ts";

export interface TerritoryGroupInterface {
  _id: number;
  company_id: number;
  name: string;
  selector: TerritorySelectorsInterface;
  shortname?: string;
  contacts?: ContactsInterface;
  address?: TerritoryAddress;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export type CreateTerritoryGroupInterface = Omit<
  TerritoryGroupInterface,
  "_id" | "created_at" | "updated_at" | "deleted_at" | "shortname"
>;

export interface TerritoryAddress {
  street: string;
  postcode: string;
  cedex?: string;
  city: string;
  country: string;
}
