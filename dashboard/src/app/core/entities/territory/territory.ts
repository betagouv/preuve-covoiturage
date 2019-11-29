/* tslint:disable:variable-name*/
import { assignOrDeleteProperties, assignOrDeleteProperty } from '~/core/entities/utils';

import { Address } from '../shared/address';
import { Bank } from '../shared/bank';
import { CGU } from '../shared/cgu';
import { Company } from '../shared/company';
import { Contacts } from '../shared/contacts';
import { BaseModel } from '~/core/entities/BaseModel';
import { IModel } from '~/core/entities/IModel';
import { IFormModel } from '~/core/entities/IFormModel';
import { IMapModel } from '~/core/entities/IMapModel';
import { IClone } from '~/core/entities/IClone';
import { TerritoryInterface } from '~/core/entities/api/shared/territory/common/interfaces/TerritoryInterface';

class Territory extends BaseModel implements IModel, IFormModel, IMapModel<Territory>, IClone<Territory> {
  public _id: number;
  public name: string;
  public siret: string;
  public shortname?: string;
  public insee?: string[];

  public company?: Company;

  public address?: Address;

  public contacts?: Contacts;

  public cgu?: CGU;
  public coordinates?: any[];

  constructor(data?: {
    _id: number;
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
    super(data);
    if (!data) {
      this.name = '';
      this.siret = null;
    }
  }

  toFormValues(fullformMode = true) {
    // TODO: keep it for later
    // const cgu = new CGU(this.cgu);
    // const formVal = cgu.toFormValues();

    const val: any = fullformMode
      ? {
          shortname: '',
          ...this,
          company: { ...new Company(this.company).toFormValues(), siret: this.siret },
          contacts: new Contacts(this.contacts).toFormValues(),
          address: new Address(this.address).toFormValues(),
        }
      : {
          contacts: new Contacts(this.contacts).toFormValues(),
        };

    delete val._id;
    delete val.siret;

    return val;
  }

  clone(): Territory {
    return new Territory(this);
  }

  map(data: any): Territory {
    super.map(data);
    this.updateFromFormValues(data);
    this._id = data._id;
    this.siret = data.siret; // override fromFormValues behaviour with siret (in company form group)

    return this;
  }

  updateFromFormValues(formValues: any): void {
    assignOrDeleteProperties(formValues, this, ['name', 'coordinates', 'shortname', 'insee']);

    this.siret = formValues.company && formValues.company.siret ? formValues.company.siret : '';

    assignOrDeleteProperty(formValues, this, 'company', (data) => new Company(data.company));
    assignOrDeleteProperty(formValues, this, 'address', (data) => new Address(data.address));
    assignOrDeleteProperty(formValues, this, 'contacts', (data) => new Contacts(data.contacts));
    assignOrDeleteProperty(formValues, this, 'cgu', (data) => new CGU(data.cgu));
  }
}

export { Address, Bank, CGU, Company, Contacts, Territory };
