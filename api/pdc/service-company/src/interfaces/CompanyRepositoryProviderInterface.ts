import { CompanyInterface } from '../shared/common/interfaces/CompanyInterface2';

export interface CompanyRepositoryProviderInterface {
  updateOrCreate(company: CompanyInterface): Promise<void>;
  findBySiret(siret: string): Promise<CompanyInterface>;
  findById(id: number): Promise<CompanyInterface>;
}

export abstract class CompanyRepositoryProviderInterfaceResolver implements CompanyRepositoryProviderInterface {
  abstract updateOrCreate(company: CompanyInterface): Promise<void>;
  abstract findBySiret(siret: string): Promise<CompanyInterface>;
  abstract findById(id: number): Promise<CompanyInterface>;
}
