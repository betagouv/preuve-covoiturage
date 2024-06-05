import _ from 'lodash';
import axios from 'axios';
import { provider, NotFoundException, ConfigInterfaceResolver } from '@ilos/common/index.ts';

import {
  CompanyDataSourceProviderInterfaceResolver,
  CompanyDataSourceProviderInterface,
} from '../interfaces/CompanyDataSourceProviderInterface.ts';

import { CompanyInterface } from '@shared/common/interfaces/CompanyInterface2.ts';

@provider({
  identifier: CompanyDataSourceProviderInterfaceResolver,
})
export class CompanyDataSourceProvider implements CompanyDataSourceProviderInterface {
  constructor(private readonly config: ConfigInterfaceResolver) {}

  async find(siret: string): Promise<CompanyInterface> {
    try {
      const { url, token, timeout } = this.config.get('dataSource');
      const { data } = await axios.get(`${url}/siret/${siret}`, {
        timeout,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (data.message) {
        throw new NotFoundException(`${data.message} (${siret})`);
      }

      const siren = siret.substring(0, 9);
      const updated_at = _.get(data, 'etablissement.dateDernierTraitementEtablissement', null);

      return {
        siret,
        siren,
        nic: _.get(data, 'etablissement.nic', null),
        legal_name: _.get(data, 'etablissement.uniteLegale.denominationUniteLegale', null),
        company_naf_code: this.cleanNaf(_.get(data, 'etablissement.uniteLegale.activitePrincipaleUniteLegale', null)),
        establishment_naf_code: this.cleanNaf(
          _.get(data, 'etablissement.uniteLegale.activitePrincipaleUniteLegale', null),
        ),
        legal_nature_code: _.get(data, 'etablissement.uniteLegale.categorieJuridiqueUniteLegale', null),
        legal_nature_label: _.get(data, 'etablissement.uniteLegale.nomenclatureActivitePrincipaleUniteLegale', null),
        nonprofit_code: null,
        intra_vat: `FR${`0${((parseInt(siren, 10) % 97) * 3 + 12) % 97}${siren}`.substr(-11)}`,
        address: [
          'etablissement.adresseEtablissement.numeroVoieEtablissement',
          'etablissement.adresseEtablissement.typeVoieEtablissement',
          'etablissement.adresseEtablissement.libelleVoieEtablissement',
          'etablissement.adresseEtablissement.codePostalEtablissement',
          'etablissement.adresseEtablissement.libelleCommuneEtablissement',
        ]
          .map((k) => _.get(data, k, ''))
          .join(' '),
        address_street: _.get(data, 'etablissement.etablissement.adresseEtablissement.libelleVoieEtablissement', null),
        address_postcode: _.get(data, 'etablissement.etablissement.adresseEtablissement.codePostalEtablissement', null),
        address_cedex: _.get(data, 'etablissement.etablissement.adresseEtablissement.libelleCedexEtablissement', null),
        address_city: _.get(data, 'etablissement.etablissement.adresseEtablissement.libelleCommuneEtablissement', null),
        headquarter: _.get(data, 'etablissement.etablissementSiege', null) === true,
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
