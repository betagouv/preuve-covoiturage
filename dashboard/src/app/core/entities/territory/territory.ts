/* tslint:disable:variable-name*/
import { AbstractControl } from '@angular/forms';
import { removeNullsProperties } from '~/core/entities/utils';
import { TerritoryInterface } from '~/shared/territory/common/interfaces/TerritoryInterface';
import { ContactInterface } from '../api/shared/common/interfaces/ContactInterface';
import {
  TerritoryAddress,
  TerritoryBaseInterface,
  TerritoryLevelEnum,
} from '../api/shared/territory/common/interfaces/TerritoryInterface';
import { ContactsMapper } from '../shared/contacts';

export class TerritoryMapper {
  static toModel(
    territoryForm: AbstractControl,
    company_id: number,
    children: number[],
    territoryId?: number,
  ): TerritoryBaseInterface | TerritoryInterface {
    const territory: TerritoryBaseInterface = {
      name: territoryForm.get('name').value,
      company_id: company_id,
      parent: territoryForm.get('parent').value,
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
  contacts?: { gdpr_dpo: ContactInterface; gdpr_controller: ContactInterface; technical: ContactInterface };
  address?: TerritoryAddress;
  inseeString: string;
  insee?: string[];
  children: number[];
}
