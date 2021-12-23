/* tslint:disable:variable-name*/
import { assignOrDeleteProperty } from '~/core/entities/utils';

import { BaseModel } from '~/core/entities/BaseModel';
import { FormModel } from '~/core/entities/IFormModel';
import { MapModel } from '~/core/entities/IMapModel';
import { Clone } from '~/core/entities/IClone';

import { Address } from '../shared/address';
import { Company } from '../shared/company';
import { Contacts } from '../shared/contacts';
import { Territory as TerritoryBaseEdit } from '../api/shared/territory/update.contract';
import { Contact } from '../shared/contact';
import { TerritorySelectionUIState } from '~/modules/territory/modules/territory-ui/data/TerritorySelectionBlock';
import { CompanyV2 } from '../shared/companyV2';

export enum TerritoryLevelEnum {
  Null = '',
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
  name: string;
  shortname?: string;
  company_id?: number;
  insee?: any;
  contacts?: Contacts;
}

export interface TerritoryUIStatus {
  ui_selection_state?: TerritorySelectionUIState[];
  format?: string;
  insee?: string;
}

export class Territory
  extends BaseModel
  implements TerritoryBase, FormModel<TerritoryFormModel>, MapModel<Territory>, Clone<Territory>
{
  level: TerritoryLevelEnum;
  name: string;
  shortname?: string;
  company_id?: number;
  company?: CompanyV2;

  address: Address;
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

    assignOrDeleteProperty(base, this, 'contacts', (data) => new Contacts(data.contacts));
    assignOrDeleteProperty(base, this, 'address', (data) => new Address(data.address));
    assignOrDeleteProperty(base, this, 'company', (data) => ({ ...data.company }));

    if (base.shortname) this.shortname = base.shortname;
    else delete this.shortname;
    if (base.company_id !== undefined) this.company_id = base.company_id;
    else delete this.company_id;
    if (base._id) this._id = base._id;
    else delete this._id;
    if (base.insee) this.insee = base.insee;
    else delete this.insee;

    return this;
  }

  updateFromFormValues(formValues: TerritoryFormModel): void {
    this.name = formValues.name;
    this.level = TerritoryLevelEnum.Towngroup;

    assignOrDeleteProperty(formValues, this, 'contacts', (data) => new Contacts(data.contacts));
    assignOrDeleteProperty(formValues, this, 'address', (data) => new Address(data.address));

    if (formValues.company_id) this.company_id = formValues.company_id;
    else delete this.company_id;

    if (formValues.insee) this.insee = formValues.insee;
    else delete this.insee;
  }

  toFormValues(fullformMode = true): any {
    return fullformMode
      ? {
          name: this.name ? this.name : '',
          shortname: this.shortname ? this.shortname : '',
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
  address?: Address;
  inseeString: string;
  insee?: string[];
}
