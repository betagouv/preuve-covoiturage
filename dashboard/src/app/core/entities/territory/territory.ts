/* tslint:disable:variable-name*/
import { hasOneNotEmptyProperty } from '~/core/entities/utils';

import { Address } from '../shared/address';
import { Bank } from '../shared/bank';
import { CGU } from '../shared/cgu';
import { Company } from '../shared/company';
import { Contacts } from '../shared/contacts';

class Territory {
  public _id: string;
  public name: string;
  public siret: string;
  public shortname?: string;
  public insee?: string[];

  public company?: Company;

  public address?: Address;

  public contacts?: Contacts;

  public cgu?: CGU;
  public coordinates?: any[];

  constructor(data: {
    _id: string;
    name: string;
    siret: string;
    shortname?: string;
    acronym?: string;
    insee?: string[];

    company?: Company;
    address?: Address;
    contacts?: Contacts;

    cgu?: CGU;
    coordinates?: any[];
  }) {
    // required data
    if (data && data._id) this._id = data._id;

    if (data && data.name) this.name = data.name;
    if (data && data.siret) this.siret = data.siret;

    // if (data && data.acronym) this.acronym = data.acronym;

    if (data && data.coordinates && data.coordinates.length) this.coordinates = data.coordinates;

    // optional data
    if (data && data.shortname) this.shortname = data.shortname;

    if (data && data.insee) this.insee = data.insee;

    // optional sub data
    if (data && hasOneNotEmptyProperty(data.company)) this.company = new Company(data.company);

    if (data && hasOneNotEmptyProperty(data.address)) this.address = new Address(data.address);

    if (data && hasOneNotEmptyProperty(data.contacts)) this.contacts = new Contacts(data.contacts);

    if (data && hasOneNotEmptyProperty(data.cgu)) this.cgu = new CGU(data.cgu);
  }

  toFormValues(fullformMode = true) {
    // TODO: keep it for later
    // const cgu = new CGU(this.cgu);
    // const formVal = cgu.toFormValues();

    const val: any = fullformMode
      ? {
          shortname: '',
          // insee: '',
          // acronym: '',
          ...this,
          company: { ...new Company(this.company).toFormValues(), siret: this.siret },
          contacts: new Contacts(this.contacts).toFormValues(),
          address: new Address(this.address).toFormValues(),
          // cgu: formVal,
        }
      : {
          contacts: new Contacts(this.contacts).toFormValues(),
        };

    delete val._id;
    delete val.siret;

    return val;
  }
}

export { Address, Bank, CGU, Company, Contacts, Territory };
