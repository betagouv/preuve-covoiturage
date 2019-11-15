import { ApplicationInterface } from '../shared/application/common/interfaces/ApplicationInterface';
import { RepositoryInterface as ListInterface } from '../shared/application/list.contract';
import { RepositoryInterface as FindInterface } from '../shared/application/find.contract';
import { RepositoryInterface as CreateInterface } from '../shared/application/create.contract';
import { RepositoryInterface as RevokeInterface } from '../shared/application/revoke.contract';

export interface ApplicationRepositoryProviderInterface {
  list(data: ListInterface): Promise<ApplicationInterface[]>;
  find(data: FindInterface): Promise<ApplicationInterface>;
  findByUuid(data: { uuid: string }): Promise<ApplicationInterface>;
  create(data: CreateInterface): Promise<ApplicationInterface>;
  revoke(data: RevokeInterface): Promise<void>;
}

export abstract class ApplicationRepositoryProviderInterfaceResolver implements ApplicationRepositoryProviderInterface {
  async list(data: ListInterface): Promise<ApplicationInterface[]> {
    throw new Error('Method not implemented.');
  }
  async find(data: FindInterface): Promise<ApplicationInterface> {
    throw new Error('Method not implemented.');
  }
  async findByUuid(data: { uuid: string }): Promise<ApplicationInterface> {
    throw new Error('Method not implemented.');
  }
  async create(data: CreateInterface): Promise<ApplicationInterface> {
    throw new Error('Method not implemented.');
  }
  async revoke(data: RevokeInterface): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
