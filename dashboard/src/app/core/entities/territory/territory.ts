/* tslint:disable:variable-name*/
import { FormGroup } from '@angular/forms';
import { BaseModel } from '~/core/entities/BaseModel';
import { Clone } from '~/core/entities/IClone';
import { FormModel } from '~/core/entities/IFormModel';
import { MapModel } from '~/core/entities/IMapModel';
import { assignOrDeleteProperty, removeNullsProperties } from '~/core/entities/utils';
import {
  TerritoryAddress,
  TerritoryBaseInterface,
  TerritoryLevelEnum,
} from '../api/shared/territory/common/interfaces/TerritoryInterface';
import { Territory as TerritoryBaseEdit } from '../api/shared/territory/update.contract';
import { Address } from '../shared/address';
import { Company } from '../shared/company';
import { CompanyV2 } from '../shared/companyV2';
import { Contact } from '../shared/contact';
import { Contacts } from '../shared/contacts';

export interface TerritoryBase extends TerritoryBaseEdit {
  name: string;
  company_id?: number;
  insee?: any;
  contacts?: Contacts;
}

export class TerritoryMapper {
  static toForm(data: TerritoryBaseInterface): FormGroup {
    throw new Error('Method not implemented.');
  }

  static toModel(form: FormGroup, company_id: number, children: number[]): TerritoryBaseInterface {
    console.debug(form.value);
    return {
      name: form.get('name').value,
      company_id: company_id,
      contacts: {
        gdpr_controller: form.get('contacts').get('gdpr_controller').value,
      },
      level: TerritoryLevelEnum.Towngroup,
      address: {
        street: null,
        postcode: null,
        city: null,
        country: null,
      },
      children: children,
    };
  }
}

export class Territory
  extends BaseModel
  implements TerritoryBaseInterface, FormModel<TerritoryFormModel>, MapModel<Territory>, Clone<Territory>
{
  level: TerritoryLevelEnum;
  name: string;
  company_id?: number;
  company?: CompanyV2;
  children: number[];

  address: TerritoryAddress;
  contacts?: Contacts;
  insee?: string[];

  constructor(base: Territory) {
    super(base);
  }

  clone(): Territory {
    return new Territory(this);
  }

  map(base: TerritoryBase): Territory {
    this.level = base.level as TerritoryLevelEnum;
    this.name = base.name;
    // this.address = base.address;

    assignOrDeleteProperty(base, this, 'contacts', (data) => new Contacts(data.contacts));
    assignOrDeleteProperty(base, this, 'address', (data) => base.address);
    assignOrDeleteProperty(base, this, 'company', (data) => ({ ...data.company }));

    if (base.company_id !== undefined) this.company_id = base.company_id;
    else delete this.company_id;
    if (base._id) this._id = base._id;
    else delete this._id;

    return this;
  }

  updateFromFormValues(formValues: TerritoryFormModel): void {
    this.name = formValues.name;
    this.level = TerritoryLevelEnum.Towngroup;
    this.company_id = formValues.company_id;
    this.children = formValues.children;

    assignOrDeleteProperty(formValues, this, 'contacts', (data) => new Contacts(data.contacts));
    this.address = removeNullsProperties(formValues.address);
  }

  toFormValues(fullformMode = true): any {
    return fullformMode
      ? {
          name: this.name ? this.name : '',
          company: new Company(this.company).toFormValues(),
          contacts: new Contacts(this.contacts).toFormValues(),
          address: new Address(this.address).toFormValues(),
          inseeString: this.insee ? this.insee : '',
        }
      : {
          contacts: new Contacts(this.contacts).toFormValues(),
        };
  }
}

export interface TerritoryFormContactModel {
  contacts?: { gdpr_dpo: Contact; gdpr_controller: Contact; technical: Contact };
}
export interface TerritoryFormModel {
  name: string;
  level: string;
  company?: {
    siret: string;
    naf_entreprise: string; // tslint:disable-line variable-name
    nature_juridique: string; // tslint:disable-line variable-name
    rna: string;
    vat_intra: string; // tslint:disable-line variable-name};
  };
  company_id?: number;
  contacts?: { gdpr_dpo: Contact; gdpr_controller: Contact; technical: Contact };
  address?: TerritoryAddress;
  inseeString: string;
  insee?: string[];
  children: number[];
}
