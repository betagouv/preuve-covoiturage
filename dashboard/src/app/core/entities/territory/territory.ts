/* tslint:disable:variable-name*/
import { assignOrDeleteProperty } from '~/core/entities/utils';

import { BaseModel } from '~/core/entities/BaseModel';
// import { Model } from '~/core/entities/IModel';
import { FormModel } from '~/core/entities/IFormModel';
import { MapModel } from '~/core/entities/IMapModel';
import { Clone } from '~/core/entities/IClone';

import { Address } from '../shared/address';
// import { Bank } from '../shared/bank';
// import { CGU } from '../shared/cgu';
import { Company } from '../shared/company';
import { Contacts } from '../shared/contacts';
import { Territory as TerritoryBaseEdit } from '../api/shared/territory/update.contract';
import { Contact } from '../shared/contact';
import { FormCompany } from '~/shared/modules/form/forms/form-company';

export enum TerritoryLevelEnum {
  Town = 'town',
  Towngroup = 'towngroup',
  District = 'district',
  Megalopolis = 'megalopolis',
  Region = 'region',
  State = 'state',
  Country = 'country',
  Countrygroup = 'countrygroup',
  Other = 'other',
}

export interface TerritoryBase extends TerritoryBaseEdit {
  level: TerritoryLevelEnum;
  name: string;
  shortname?: string;
  company_id?: number;
  active?: boolean;
  // active_since?: Date;
  contacts?: Contacts;
  density?: number;
  geo?: any; // TODO : geography type
}

export class Territory extends BaseModel
  implements TerritoryBase, FormModel<TerritoryFormModel>, MapModel<Territory>, Clone<Territory> {
  level: TerritoryLevelEnum;
  name: string;
  shortname?: string;
  company_id?: number;
  company?: Company;
  active?: boolean;
  address: Address;
  // active_since?: Date;
  contacts?: Contacts;
  density?: number;
  geo?: any; // TODO : geography type

  constructor(base: Territory) {
    super(base);
  }

  clone(): Territory {
    return new Territory(this);
  }

  map(base: TerritoryBase): Territory {
    this.level = base.level;
    this.name = base.name;

    if (this.name !== undefined) this.name = base.name;
    // if (this.active_since !== undefined) this.active_since = base.active_since;
    if (this.density !== undefined) this.density = base.density;
    if (this.shortname !== undefined) this.shortname = base.shortname;
    if (this.active !== undefined) this.active = base.active;

    assignOrDeleteProperty(base, this, 'contacts', (data) => new Contacts(data.contacts));
    assignOrDeleteProperty(base, this, 'address', (data) => new Address(data.address));
    assignOrDeleteProperty(base, this, 'company', (data) => ({ ...data.company }));
    assignOrDeleteProperty(base, this, 'geo', (data) => ({ ...data.geo }));

    return this;
  }

  updateFromFormValues(formValues: TerritoryFormModel): void {
    // this.level = formValues.level;
    this.level = TerritoryLevelEnum.Country;
    this.name = formValues.name;

    if (this.name !== undefined) this.name = formValues.name;
    if (this.density !== undefined) this.density = formValues.density;
    if (this.shortname !== undefined) this.shortname = formValues.shortname;

    assignOrDeleteProperty(formValues, this, 'contacts', (data) => new Contacts(data.contacts));
  }

  toFormValues(fullformMode = true): any {
    return fullformMode
      ? {
          name: this.name ? this.name : '',
          // level: this.level ? this.level : null,
          // active: this.active ? this.active : false,

          shortname: this.shortname ? this.shortname : '',

          company: new Company(this.company).toFormValues(),
          contacts: new Contacts(this.contacts).toFormValues(),
          address: new Address(this.address).toFormValues(),
        }
      : {
          contacts: new Contacts(this.contacts).toFormValues(),
        };
  }
}

export interface TerritoryFormModel {
  name: string;
  // level: TerritoryLevelEnum;
  // active?: boolean;

  // siret: string;
  density?: number;
  shortname?: string;
  // insee?: string[];

  company?: FormCompany;
  contacts?: { gdpr_dpo: Contact; gdpr_controller: Contact; technical: Contact };
  address?: Address;
  // public address?: Address;

  // public cgu?: CGU;
  // public coordinates?: any[];
}
/*
class Territory extends BaseModel implements Model, MapModel<Territory>, Clone<Territory> {
  public _id: number;
  public name: string;
  public siret: string;
  public shortname?: string;
  public insee?: string[];

  public company?: Company;
  public company_id?: number;

  public address?: Address;

  public contacts?: Contacts;

  public cgu?: CGU;
  public coordinates?: any[];

  constructor(data?: {
    _id?: number;
    name: string;
    siret: string;
    shortname?: string;
    acronym?: string;
    insee?: string[];
    children?: number[];
    company?: Company;
    company_id?: number;
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

  toFormValues(fullformMode = true): any {
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
    this.name = data.name; // override fromFormValues behaviour with siret (in company form group)

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
*/
