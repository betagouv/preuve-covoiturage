import { ParentRepositoryInterface, ParentRepositoryInterfaceResolver } from '@ilos/repository';

declare type Model = any;

export interface ApplicationRepositoryProviderInterface extends ParentRepositoryInterface {
  check(params: { _id: string; operatorId: string }): Promise<boolean>;
  softDelete(params: { _id: string; operatorId: string }): Promise<boolean>;
}

export abstract class ApplicationRepositoryProviderInterfaceResolver extends ParentRepositoryInterfaceResolver
  implements ApplicationRepositoryProviderInterface {
  async check(params: { _id: string; operatorId: string }): Promise<boolean> {
    throw new Error('Not implemented');
  }
  async softDelete(params: { _id: string; operatorId: string }): Promise<Model> {
    throw new Error('Not implemented');
  }
}
