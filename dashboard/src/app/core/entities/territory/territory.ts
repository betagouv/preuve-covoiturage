/* tslint:disable:variable-name*/
import { Address } from '../shared/address';
import { Bank } from '../shared/bank';
import { CGU } from '../shared/cgu';
import { Company } from '../shared/company';
import { Contacts } from '../shared/contacts';

class Territory {
  public _id: string;
  public name: string;
  public shortname?: string;
  public acronym?: string;
  public insee?: string[];
  public insee_main?: string;
  public network_id?: number;

  public company?: Company;

  public address?: Address;

  public contacts?: Contacts;

  public cgu?: CGU;
  public coordinates?: any[];

  constructor(data: {
    _id: string;
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
    coordinates?: [];
  }) {
    this._id = data._id;
    this.name = data.name;
    this.acronym = data.acronym || null;
    this.company = data.company || new Company({ siren: null });
    this.address = data.address || new Address({ street: null, postcode: null, city: null, country: null });
    this.contacts = data.contacts || new Contacts();
    this.cgu = data.cgu || new CGU();
    this.coordinates = data.coordinates || null;

    if (this.shortname) {
      this.shortname = data.shortname;
    }
    if (this.insee) {
      this.insee = data.insee;
    }
    if (this.insee_main) {
      this.insee_main = data.insee_main;
    }
    if (this.network_id) {
      this.network_id = data.network_id;
    }
  }
}

export { Address, Bank, CGU, Company, Contacts, Territory };
