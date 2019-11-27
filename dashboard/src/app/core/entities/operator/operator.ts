/* tslint:disable:variable-name*/
import { hasOneNotEmptyProperty } from '~/core/entities/utils';

import { Address } from '../shared/address';
import { Bank } from '../shared/bank';
import { CGU } from '../shared/cgu';
import { Company } from '../shared/company';
import { Contacts } from '../shared/contacts';
import { IFormModel } from '~/core/entities/IFormModel';
import { IModel } from '~/core/entities/IModel';
import { IMapModel } from '~/core/entities/IMapModel';
import { BaseModel } from '~/core/entities/BaseModel';
import { IClone } from '~/core/entities/IClone';

class Operator extends BaseModel implements IFormModel, IModel, IMapModel<Operator>, IClone<Operator> {
  public _id: number;
  public name: string;
  public legal_name: string;
  public siret: string;

  public company?: Company;

  public address?: Address;

  public contacts?: Contacts;

  public bank?: Bank;

  constructor(data?: {
    _id: number;
    name: string;
    siret: string;
    legal_name: string;
    company?: Company;
    address?: Address;
    contacts?: Contacts;
    bank?: Bank;
  }) {
    super(data);
    if (!data) {
      this.name = '';
      this.legal_name = '';
      this.siret = '';
    }
  }

  map(data: any): Operator {
    super.map(data);
    this.name = data.name;
    this.legal_name = data.legal_name;
    this.siret = data.siret;
    this.updateFromFormValues(data);
    this._id = data._id;
    return this;
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

  updateFromFormValues(formValues: any): void {
    this._id = formValues._id;
    this.name = formValues.name;
    this.legal_name = formValues.legal_name;
    this.siret = formValues.siret;

    if (hasOneNotEmptyProperty(formValues.company)) {
      this.company = new Company(formValues.company);
    }

    if (hasOneNotEmptyProperty(formValues.address)) {
      this.address = new Address(formValues.address);
    }

    if (hasOneNotEmptyProperty(formValues.contacts)) {
      this.contacts = new Contacts(formValues.contacts);
    }

    if (hasOneNotEmptyProperty(formValues.bank)) {
      this.bank = new Bank(formValues.bank);
    }
  }

  clone(): Operator {
    return new Operator(this);
  }
}

export { Address, Bank, CGU, Company, Contacts, Operator };
