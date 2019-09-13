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
  public createdAt: Date;
  // tslint:disable-next-line: variable-name
  public updatedAt: Date;
  // tslint:disable-next-line: variable-name
  public deletedAt: Date;

  public constructor(data: OperatorInterface) {
    this._id = data._id;
    this.nom_commercial = data.nom_commercial;
    this.raison_sociale = data.raison_sociale;
    this.company = data.company;
    this.address = data.address;
    this.bank = data.bank;
    this.contacts = data.contacts;
    this.cgu = data.cgu;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.deletedAt = data.deletedAt;
  }
}
