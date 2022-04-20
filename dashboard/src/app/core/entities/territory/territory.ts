/* tslint:disable:variable-name*/
import { AbstractControl } from '@angular/forms';
import { removeNullsProperties } from '~/core/entities/utils';
import { ContactInterface } from '../api/shared/common/interfaces/ContactInterface';
import {
  CreateTerritoryGroupInterface,
  TerritoryAddress,
} from '../api/shared/territory/common/interfaces/TerritoryInterface';
import { ContactsMapper } from '../shared/contacts';

export class TerritoryMapper {
  static toModel(
    territoryForm: AbstractControl,
    company_id: number,
    children: number[],
  ): CreateTerritoryGroupInterface {
    const territory: CreateTerritoryGroupInterface = {
      name: territoryForm.get('name').value,
      company_id: company_id,
      // parent: territoryForm.get('parent').value,
      contacts: ContactsMapper.toModel(territoryForm.get('contacts')),
      // level: TerritoryLevelEnum.Towngroup,
      address: removeNullsProperties(territoryForm.get('address').value),
      selector: {
        _id: children,
      },
    };
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
  // children: number[];
}
