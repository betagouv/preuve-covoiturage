import { CompanyInterface } from '../shared/common/interfaces/CompanyInterface2';

export interface CompanyDataSourceProviderInterface {
  find(siret: string): Promise<CompanyInterface>;
}

export abstract class CompanyDataSourceProviderInterfaceResolver implements CompanyDataSourceProviderInterface {
  async find(siret: string): Promise<CompanyInterface> {
    throw new Error();
  }
}
