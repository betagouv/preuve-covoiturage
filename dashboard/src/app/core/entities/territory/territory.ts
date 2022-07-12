import { TerritorySelectorsInterface } from '~/shared/territory/common/interfaces/TerritoryCodeInterface';
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
    territoryGroupName: string,
    aom?: string,
    epci?: string,
  ): CreateTerritoryGroupInterface {
    let selector: TerritorySelectorsInterface;
    if (aom) {
      selector = {
        aom: [aom],
      };
    } else if (epci) {
      selector = {
        epci: [epci],
      };
    }
    const territory: CreateTerritoryGroupInterface = {
      name: territoryGroupName,
      company_id: company_id,
      contacts: ContactsMapper.toModel(territoryForm.get('contacts')),
      address: removeNullsProperties(territoryForm.get('address').value),
      selector,
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
