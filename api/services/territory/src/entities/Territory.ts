import {
  TerritoryInterface,
  CompanyInterface,
  AddressInterface,
  ContactsInterface,
  CguInterface,
} from '@pdc/provider-schema';

export class Territory implements TerritoryInterface {
  public _id: string;
  public name: string;
  public shortname?: string;
  public acronym?: string;
  public insee?: string[];
  // tslint:disable-next-line: variable-name
  public insee_main?: string;
  // tslint:disable-next-line: variable-name
  public network_id?: number;

  public company?: CompanyInterface;
  public address?: AddressInterface;
  public contacts?: ContactsInterface;
  public cgu: CguInterface;

  public geometry?: {
    type: string;
    coordinates: any[];
  };

  // tslint:disable-next-line: variable-name
  public created_at?: Date;
  // tslint:disable-next-line: variable-name
  public updated_at?: Date;
  // tslint:disable-next-line: variable-name
  public deleted_at?: Date;

  constructor(data: TerritoryInterface) {
    this._id = data._id;
    this.name = data.name;
    this.shortname = data.shortname;
    this.acronym = data.acronym;
    this.insee = data.insee;
    this.insee_main = data.insee_main;
    this.network_id = data.network_id;
    this.company = data.company;
    this.address = data.address;
    this.contacts = data.contacts;
    this.cgu = data.cgu;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.deleted_at = data.deleted_at;
  }
}
