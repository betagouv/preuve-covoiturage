/* tslint:disable:variable-name*/

import { Address } from './address';
import { ContactList } from './contactList';
import { CGU } from './cgu';
import { Company } from './company';
import { Geometry } from './geometry';

class Aom {
  _id: string;
  name: string;
  shortname: string;
  acronym: string;
  insee: [];
  insee_main: string;
  createdAt: string;
  updatedAt: string;
  network_id: number;
  company: Company;
  address: Address;
  contacts: ContactList;
  cgu: CGU;
  geometry: Geometry;

  constructor(obj?: any) {
    this._id = (obj && obj._id) || null;
    this.name = (obj && obj.name) || null;
    this.shortname = (obj && obj.shortname) || null;
    this.acronym = (obj && obj.acronym) || null;
    this.insee = (obj && obj.insee) || [];
    this.insee_main = (obj && obj.insee_main) || [];
    this.createdAt = (obj && obj.createdAt) || null;
    this.updatedAt = (obj && obj.updatedAt) || null;
    this.network_id = (obj && obj.network_id) || null;
    this.company = (obj && obj.company) || new Company();
    this.address = (obj && obj.address) || new Address();
    this.contacts = (obj && obj.contacts) || new ContactList();
    this.cgu = (obj && obj.cgu) || new CGU();
    this.geometry = (obj && obj.geometry) || null;
  }
}

export { Company, Aom, Address, ContactList, CGU, Geometry };
