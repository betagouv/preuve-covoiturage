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
  public coordinates: any[];

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
    this.shortname = data.shortname;
    this.acronym = data.acronym;
    this.insee = data.insee;
    this.insee_main = data.insee_main;
    this.network_id = data.network_id;
    this.company = data.company || new Company({ siren: null });
    this.address = data.address || new Address({ street: null, postcode: null, city: null, country: null });
    this.contacts = data.contacts || new Contacts();
    this.cgu = data.cgu || new CGU();
    this.coordinates = data.coordinates || null;
  }
}

export { Address, Bank, CGU, Company, Contacts, Territory };
