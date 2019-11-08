import { CompanyInterface } from '../shared/common/interfaces/CompanyInterface2';

export interface CompanyRepositoryProviderInterface {
  updateOrCreate(company: CompanyInterface): Promise<void>;
  find(siret: string): Promise<CompanyInterface>;
}

export abstract class CompanyRepositoryProviderInterfaceResolver implements CompanyRepositoryProviderInterface {
  async updateOrCreate(company: CompanyInterface): Promise<void> {
    throw new Error();
  }
  async find(siret: string): Promise<CompanyInterface> {
    throw new Error();
  }
}
