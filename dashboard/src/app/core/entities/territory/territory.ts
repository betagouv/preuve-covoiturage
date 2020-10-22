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

export const territoryLevelLabels = [
  [null, ''],

  [TerritoryLevelEnum.Town, 'Commune'],
  // [TerritoryLevelEnum.Epic, 'EPCI'],
  [TerritoryLevelEnum.Towngroup, 'EPCI'],
  [TerritoryLevelEnum.District, 'District'],
  [TerritoryLevelEnum.Megalopolis, 'Département'],
  [TerritoryLevelEnum.Region, 'Region'],
  [TerritoryLevelEnum.State, 'Etat'],
  [TerritoryLevelEnum.Country, 'Pays'],
  [TerritoryLevelEnum.Countrygroup, 'Groupe de pays'],
  [TerritoryLevelEnum.Other, 'Autre'],
];

export interface TerritoryTree {
  _id: number;
  name: string;
  children?: TerritoryTree[];
  level?: TerritoryLevelEnum;
  parents?: number[];
  indent: number;
  activable;
}

export interface TerritoryBase extends TerritoryBaseEdit {
  // level: TerritoryLevelEnum;
  name: string;
  shortname?: string;
  company_id?: number;
  active?: boolean;
  activable?: boolean;
  ui_status?: TerritoryUIStatus;
  insee?: any;
  // active_since?: Date;
  contacts?: Contacts;
  density?: number;
  geo?: any; // TODO : geography type
}

export interface TerritoryInsee {
  _id: number;
  name: string;
  insee: string;
}

export interface TerritoryUIStatus {
  ui_selection_state?: TerritorySelectionUIState[];
  format?: string;
  insee?: string;
}

export class Territory extends BaseModel
  implements TerritoryBase, FormModel<TerritoryFormModel>, MapModel<Territory>, Clone<Territory> {
  level: TerritoryLevelEnum;
  name: string;
  shortname?: string;
  company_id?: number;
  company?: CompanyV2;
  active?: boolean;
  activable?: boolean;
  children?: number[];

  active_since?: Date;
  population?: number;
  surface?: number;
  address: Address;
  // active_since?: Date;
  contacts?: Contacts;
  density?: number;
  geo?: any; // TODO : geography type
  insee?: string[];

  ui_status: TerritoryUIStatus;

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
    assignOrDeleteProperty(base, this, 'geo', (data) => ({ ...data.geo }));
    assignOrDeleteProperty(base, this, 'children', (data) => [...data.children]);

    if (base.shortname) this.shortname = base.shortname;
    else delete this.shortname;
    if (base.density !== undefined) this.density = base.density;
    else delete this.density;
    if (base.company_id !== undefined) this.company_id = base.company_id;
    else delete this.company_id;
    if (base._id) this._id = base._id;
    else delete this._id;
    if (base.ui_status) this.ui_status = base.ui_status;
    else delete this.ui_status;
    if (base.insee) this.insee = base.insee;
    else delete this.insee;

    this.active = base.active === true;
    this.activable = base.activable === true;

    return this;
  }

  updateFromFormValues(formValues: TerritoryFormModel): void {
    // this.level = formValues.level;
    // this.level = TerritoryLevelEnum.Country;
    this.name = formValues.name;
    this.level = formValues.level !== undefined ? (formValues.level as TerritoryLevelEnum) : TerritoryLevelEnum.Country;
    this.active = formValues.active === true;
    this.activable = formValues.activable === true;

    assignOrDeleteProperty(formValues, this, 'contacts', (data) => new Contacts(data.contacts));
    assignOrDeleteProperty(formValues, this, 'address', (data) => new Address(data.address));

    if (formValues.shortname) this.shortname = formValues.shortname;
    else delete this.shortname;

    // if (formValues.insee && formValues.format === 'insee') this.insee = formValues.insee.split(',');
    // else delete this.insee;

    if (formValues.geo && formValues.format === 'geo') this.geo = formValues.geo;
    else delete this.geo;

    if (formValues.density !== undefined) this.density = formValues.density;
    else delete this.density;

    if (formValues.company_id) this.company_id = formValues.company_id;
    else delete this.company_id;

    if (formValues.children && (formValues.format === 'parent' || formValues.format === 'insee'))
      this.children = formValues.children;
    else delete this.children;

    this.ui_status = {};
    if (formValues.uiSelectionState) this.ui_status.ui_selection_state = formValues.uiSelectionState;
    if (formValues.format) this.ui_status.format = formValues.format;
    if (formValues.format === 'insee' && formValues.insee) {
      this.ui_status.insee = formValues.insee;
    }

    // insee are used to fetch children array (territory_id[])
    delete this.insee;

    if (!formValues.activable) {
      delete this.address;
      delete this.contacts;
      delete this.company_id;
    }

    delete this.company;

    // const territories = await this.terr

    // assignOrDeleteProperty(formValues, this, 'shortname');
    // assignOrDeleteProperty(formValues, this, 'density');
    // assignOrDeleteProperty(formValues, this, 'company_id');
  }

  toFormValues(fullformMode = true): any {
    return fullformMode
      ? {
          name: this.name ? this.name : '',
          uiSelectionState:
            this.ui_status && this.ui_status.ui_selection_state ? this.ui_status.ui_selection_state : [],
          format: this.ui_status && this.ui_status.format ? this.ui_status.format : 'parent',
          shortname: this.shortname ? this.shortname : '',
          active: !!this.active,
          activable: !!this.activable,
          level: this.level ? this.level : null,
          // children: this.children ? this.children : [],
          company: new Company(this.company).toFormValues(),
          contacts: new Contacts(this.contacts).toFormValues(),
          address: new Address(this.address).toFormValues(),
          geo: this.geo ? this.geo : '{"type": "MultiPolygon", "coordinates": [[[[],[],[],[]]]]}',
          insee:
            this.ui_status && this.ui_status.format === 'insee' && this.ui_status.insee ? this.ui_status.insee : '',
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
  // level: TerritoryLevelEnum;
  // active?: boolean;
  level: string;
  // siret: string;
  density?: number;
  shortname?: string;
  // insee?: string[];
  active?: boolean;
  children?: number[];
  activable?: boolean;
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
  uiSelectionState: TerritorySelectionUIState[];
  format: string;
  geo?:
    | string
    | {
        type: 'MultiPolygon';
        coordinates: number[][][2];
      };
  insee?: string;

  // public address?: Address;

  // public cgu?: CGU;
  // public coordinates?: any[];
}
