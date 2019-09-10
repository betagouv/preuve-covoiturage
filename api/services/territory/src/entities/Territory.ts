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
  public createdAt?: Date;
  // tslint:disable-next-line: variable-name
  public updatedAt?: Date;
  // tslint:disable-next-line: variable-name
  public deletedAt?: Date;

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
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.deletedAt = data.deletedAt;
  }
}
