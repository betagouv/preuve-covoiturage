/* tslint:disable:variable-name*/
import { assignOrDeleteProperties, assignOrDeleteProperty } from '~/core/entities/utils';

import { FormModel } from '~/core/entities/IFormModel';
import { Model } from '~/core/entities/IModel';
import { MapModel } from '~/core/entities/IMapModel';
import { BaseModel } from '~/core/entities/BaseModel';
import { Clone } from '~/core/entities/IClone';

import { Address } from '../shared/address';
import { Bank } from '../shared/bank';
import { CGU } from '../shared/cgu';
import { Company } from '../shared/company';
import { Contacts } from '../shared/contacts';

class Operator extends BaseModel implements FormModel, Model, MapModel<Operator>, Clone<Operator> {
  public _id: number;
  public name: string;
  public legal_name: string;
  public siret: string;

  public company?: Company;

  public address?: Address;

  public thumbnail?: string | null;
  public contacts?: Contacts;

  public bank?: Bank;

  cgu_accepted_at?: Date;
  cgu_accepted_by?: number;

  constructor(data?: {
    _id: number;
    name: string;
    siret: string;
    legal_name: string;
    thumbnail?: string | null;
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
    this.updateFromFormValues(data);
    this._id = data._id;
    this.siret = data.siret;
    this.thumbnail = data.thumbnail;

    return this;
  }

  toFormValues(fullFormMode = true): any {
    const val: any = fullFormMode
      ? {
          ...this,
          thumbnail: this.thumbnail ? this.thumbnail : null,
          name: this.name || '',
          legal_name: this.legal_name || '',
          company: { ...new Company(this.company).toFormValues(), siret: this.siret },
          contacts: new Contacts(this.contacts).toFormValues(),
          bank: new Bank(this.bank).toFormValues(),
          address: new Address(this.address).toFormValues(),
        }
      : {
          thumbnail: this.thumbnail ? this.thumbnail : null,

          contacts: new Contacts(this.contacts).toFormValues(),
        };

    delete val._id;
    delete val.siret;

    return val;
  }

  updateFromFormValues(formValues: any): void {
    assignOrDeleteProperties(formValues, this, ['name', 'legal_name']);

    this.siret = formValues.company && formValues.company.siret ? formValues.company.siret : '';
    this.thumbnail = formValues.thumbnail;

    assignOrDeleteProperty(formValues, this, 'company', (data) => new Company(data.company));
    assignOrDeleteProperty(formValues, this, 'address', (data) => new Address(data.address));
    assignOrDeleteProperty(formValues, this, 'contacts', (data) => new Contacts(data.contacts));
    assignOrDeleteProperty(formValues, this, 'bank', (data) => new Bank(data.bank));
  }

  clone(): Operator {
    return new Operator(this);
  }
}

export { Address, Bank, CGU, Company, Contacts, Operator };
