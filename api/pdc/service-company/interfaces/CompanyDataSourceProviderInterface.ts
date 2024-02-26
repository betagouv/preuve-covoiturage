import { CompanyInterface } from '../shared/common/interfaces/CompanyInterface2';

export interface CompanyDataSourceProviderInterface {
  find(siret: string): Promise<CompanyInterface>;
  find_many(sirets: string[], parallelCall?: number): Promise<CompanyInterface[]>;
}

export abstract class CompanyDataSourceProviderInterfaceResolver implements CompanyDataSourceProviderInterface {
  async find(siret: string): Promise<CompanyInterface> {
    throw new Error();
  }

  async find_many(sirets: string[], parallelCall = 4): Promise<CompanyInterface[]> {
    throw new Error();
  }
}
