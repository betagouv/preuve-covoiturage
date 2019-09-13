import {
  OperatorInterface,
  CompanyInterface,
  AddressInterface,
  BankInterface,
  ContactsInterface,
  CguInterface,
} from '@pdc/provider-schema';

export class Operator implements OperatorInterface {
  public _id: string;

  // tslint:disable-next-line
  public nom_commercial: string;
  // tslint:disable-next-line
  public raison_sociale: string;

  public company: CompanyInterface;
  public address: AddressInterface;
  public bank: BankInterface;
  public contacts: ContactsInterface;
  public cgu: CguInterface;

  // tslint:disable-next-line: variable-name
  public created_at: Date;
  // tslint:disable-next-line: variable-name
  public updated_at: Date;
  // tslint:disable-next-line: variable-name
  public deleted_at: Date;

  public constructor(data: OperatorInterface) {
    this._id = data._id;
    this.nom_commercial = data.nom_commercial;
    this.raison_sociale = data.raison_sociale;
    this.company = data.company;
    this.address = data.address;
    this.bank = data.bank;
    this.contacts = data.contacts;
    this.cgu = data.cgu;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.deleted_at = data.deleted_at;
  }
}
