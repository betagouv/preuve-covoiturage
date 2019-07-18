/* tslint:disable:variable-name*/
import { Address } from '../shared/address';
import { Bank } from '../shared/bank';
import { CGU } from '../shared/cgu';
import { Company } from '../shared/company';
import { Contacts } from '../shared/contacts';


class Territory {
  public _id?: string;
  public name: string;
  public shortname?: string;
  public acronym?: string;
  public insee?: string[];
  // tslint:disable-next-line: variable-name
  public insee_main?: string;
  // tslint:disable-next-line: variable-name
  public network_id?: number;

  public company?: Company;

  public address?: Address;

  public contacts?: Contacts;

  public cgu?: CGU;

  constructor(data: {
    _id?: string;
    name: string;
    shortname?: string;
    acronym?: string;
    insee?: string[];
    insee_main?: string;
    network_id?: number;
    company?: Company;
    address?: Address;
    contacts?: Contacts;
    cgu?: CGU;
  }) {
    if ('_id' in data) {
      this._id = data._id;
    }
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
  }
}

export { Address, Bank, CGU, Company, Contacts, Territory };
