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
  protected domain = 'https://entreprise.data.gouv.fr/api/sirene/v3';

  async find(siret: string): Promise<CompanyInterface> {
    try {
      const { data } = await axios.get(`${this.domain}/etablissements/${siret}`);

      if (data.message) {
        throw new NotFoundException(`${data.message} (${siret})`);
      }

      const siren = siret.substring(0, 9);
      const updated_at = get(data, 'etablissement.updated_at', null);

      return {
        siret,
        siren,
        nic: get(data, 'etablissement.nic', null),
        legal_name: get(data, 'etablissement.unite_legale.denomination', null),
        company_naf_code: this.cleanNaf(get(data, 'etablissement.unite_legale.activite_principale', null)),
        establishment_naf_code: this.cleanNaf(get(data, 'etablissement.activite_principale', null)),
        legal_nature_code: get(data, 'etablissement.unite_legale.categorie_juridique', null),
        legal_nature_label: get(data, 'etablissement.unite_legale.denomination', null),
        nonprofit_code: null,
        intra_vat: get(
          data,
          'etablissement.unite_legale.numero_tva_intra',
          `FR${`0${((parseInt(siren) % 97) * 3 + 12) % 97}${siren}`.substr(-11)}`,
        ),
        address: get(data, 'etablissement.geo_adresse', null),
        address_street: get(data, 'etablissement.geo_l4', null),
        address_postcode: get(data, 'etablissement.code_postal', null),
        address_cedex: get(data, 'etablissement.code_cedex', null),
        address_city: get(data, 'etablissement.libelle_commune', null),
        lon: Number(get(data, 'etablissement.longitude', 0)) || 0,
        lat: Number(get(data, 'etablissement.latitude', 0)) || 0,
        headquarter: get(data, 'etablissement.etablissement_siege', null) === 'true',
        updated_at: updated_at ? new Date(updated_at) : null,
      };
    } catch (e) {
      if (e.isAxiosError && e.response && e.response.status === 404) {
        throw new NotFoundException(`Company not found (${siret})`);
      }
      throw e;
    }
  }

  async find_many(sirets: string[], parallelCall = 4): Promise<CompanyInterface[]> {
    let company_count = -1;
    const res: CompanyInterface[] = [];

    const apiCall = async (): Promise<boolean> => {
      company_count++;
      if (company_count >= sirets.length) return Promise.resolve(true);
      res.push(await this.find(sirets[company_count]));
      return apiCall();
    };

    const parallelCalls = new Array(parallelCall).map(() => apiCall());

    return Promise.all(parallelCalls).then(() => res);
  }

  private cleanNaf(str: string | null): string | null {
    if (str === null) return null;
    return str.replace(/[^A-Z0-9]/g, '');
  }
}
