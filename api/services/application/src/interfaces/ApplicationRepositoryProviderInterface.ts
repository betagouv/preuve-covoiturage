import { ApplicationInterface } from '../shared/application/common/interfaces/ApplicationInterface';

export interface ApplicationRepositoryProviderInterface {
  find(_id: string, owner_id?: string, owner_service?: string): Promise<ApplicationInterface>;
  delete(_id: string, owner_id?: string, owner_service?: string): Promise<void>;
  createForOperator(name: string, operator_id: string): Promise<ApplicationInterface>;
  allByOperator(operator_id: string): Promise<ApplicationInterface[]>;
}

export abstract class ApplicationRepositoryProviderInterfaceResolver implements ApplicationRepositoryProviderInterface {
  async find(_id: string, owner_id?: string, owner_service?: string): Promise<ApplicationInterface> {
    throw new Error('Method not implemented.');
  }
  async delete(_id: string, owner_id?: string, owner_service?: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  async createForOperator(name: string, operator_id: string): Promise<ApplicationInterface> {
    throw new Error('Method not implemented.');
  }
  async allByOperator(operator_id: string): Promise<ApplicationInterface[]> {
    throw new Error('Method not implemented.');
  }
}
