import { get } from 'lodash';
import axios from 'axios';
import { provider, NotFoundException } from '@ilos/common';

import {
  CompanyDataSourceProviderInterfaceResolver,
  CompanyDataSourceProviderInterface,
} from '../interfaces/CompanyDataSourceProviderInterface';

import { CompanyInterface } from '../shared/common/interfaces/CompanyInterface2';

@provider({
  identifier: CompanyDataSourceProviderInterfaceResolver,
})
export class CompanyDataSourceProvider implements CompanyDataSourceProviderInterface {
  protected domain = 'https://entreprise.data.gouv.fr/api/sirene/v1';

  async find(siret: string): Promise<CompanyInterface> {
    try {
      const { data } = await axios.get(`${this.domain}/siret/${siret}`);

      if (data.message) {
        throw new NotFoundException(`${data.message} (${siret})`);
      }

      return {
        siret: get(data, 'etablissement.siret', null),
        siren: get(data, 'etablissement.siren', null),
        nic: get(data, 'etablissement.nic', null),
        legal_name: get(data, 'etablissement.nom_raison_sociale', null),
        company_naf_code: get(data, 'etablissement.activite_principale_entreprise', null),
        establishment_naf_code: get(data, 'etablissement.activite_principale', null),
        legal_nature_code: get(data, 'etablissement.nature_juridique_entreprise', null),
        legal_nature_label: get(data, 'etablissement.libelle_nature_juridique_entreprise', null),
        nonprofit_code: get(data, 'etablissement.numero_rna', null),
        intra_vat: get(data, 'numero_tva_intra', null), // FIXME this is not working, need to do a 2nd call on siren
        address: get(data, 'etablissement.geo_adresse', null),
        lon: Number(get(data, 'etablissement.longitude', null)) || null,
        lat: Number(get(data, 'etablissement.latitude', null)) || null,
        headquarter: get(data, 'etablissement.is_siege', null) === '1',
        updated_at:
          get(data, 'etablissement.updated_at', null) === null ? null : new Date(get(data, 'etablissement.updated_at')),
      };
    } catch (e) {
      if (e.isAxiosError && e.response.status === 404) {
        throw new NotFoundException(`Company not found (${siret})`);
      }
      throw e;
    }
  }
}
