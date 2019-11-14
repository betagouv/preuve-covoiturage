import { hasOneNotEmptyProperty } from '~/core/entities/utils';
/* tslint:disable:variable-name*/
import { Address } from '../shared/address';
import { Bank } from '../shared/bank';
import { CGU } from '../shared/cgu';
import { Company } from '../shared/company';
import { Contacts } from '../shared/contacts';

class Operator {
  public _id: string;
  public name: string;
  public legal_name: string;
  public siret: string;

  public company?: Company;

  public address?: Address;

  public contacts?: Contacts;

  public bank?: Bank;

  constructor(data: {
    _id: string;
    name: string;
    siret: string;
    legal_name: string;
    company?: Company;
    address?: Address;
    contacts?: Contacts;
    bank?: Bank;
  }) {
    if (data) {
      this._id = data._id;
      this.name = data.name;
      this.legal_name = data.legal_name;
      this.siret = data.siret;

      if (hasOneNotEmptyProperty(data.company)) {
        this.company = new Company(data.company);
      }

      if (hasOneNotEmptyProperty(data.address)) {
        this.address = new Address(data.address);
      }

      if (hasOneNotEmptyProperty(data.contacts)) {
        this.contacts = new Contacts(data.contacts);
      }

      if (hasOneNotEmptyProperty(data.bank)) {
        this.bank = new Bank(data.bank);
      }
    } else {
      this.name = '';
      this.legal_name = '';
    }
  }

  toFormValues(fullFormMode = true) {
    const val: any = fullFormMode
      ? {
          ...this,
          company: { ...new Company(this.company).toFormValues(), siret: this.siret },
          contacts: new Contacts(this.contacts).toFormValues(),
          bank: new Bank(this.bank).toFormValues(),
          address: new Address(this.address).toFormValues(),
        }
      : {
          contacts: new Contacts(this.contacts).toFormValues(),
        };

    delete val._id;
    delete val.siret;

    return val;
  }
}

export { Address, Bank, CGU, Company, Contacts, Operator };
