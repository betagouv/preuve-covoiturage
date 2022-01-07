/* tslint:disable:variable-name*/
import { AbstractControl } from '@angular/forms';
import { removeNullsProperties } from '~/core/entities/utils';
import { TerritoryInterface } from '../../../../../../shared/territory/common/interfaces/TerritoryInterface';
import {
  TerritoryAddress,
  TerritoryBaseInterface,
  TerritoryLevelEnum,
} from '../api/shared/territory/common/interfaces/TerritoryInterface';
import { Address } from '../shared/address';
import { Contact } from '../shared/contact';
import { Contacts, ContactsMapper } from '../shared/contacts';

export interface TerritoryBase extends TerritoryInterface {
  name: string;
  company_id?: number;
  insee?: any;
  contacts?: Contacts;
}

export class TerritoryMapper {
  static toForm(data: TerritoryBaseInterface, fullformMode = true): any {
    return fullformMode
      ? {
          name: data.name ? data.name : '',
          contacts: data.contacts ? data.contacts : undefined,
          address: new Address(data.address).toFormValues(),
          inseeString: '',
        }
      : {
          contacts: data.contacts ? data.contacts : undefined,
        };
  }

  static toModel(
    territoryForm: AbstractControl,
    company_id: number,
    children: number[],
    territoryId?: number,
  ): TerritoryBaseInterface | TerritoryInterface {
    const territory: TerritoryBaseInterface = {
      name: territoryForm.get('name').value,
      company_id: company_id,
      contacts: ContactsMapper.toModel(territoryForm.get('contacts')),
      level: TerritoryLevelEnum.Towngroup,
      address: removeNullsProperties(territoryForm.get('address').value),
      children: children,
    };
    if (territoryId) {
      return {
        _id: territoryId,
        ...territory,
      };
    }
    return territory;
  }
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
