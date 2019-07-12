import { ParentRepositoryInterface, ParentRepositoryInterfaceResolver } from '@ilos/repository';

declare type Model = any;

export interface ApplicationRepositoryProviderInterface extends ParentRepositoryInterface {
  softDelete(params: { _id: string; operator_id: string }): Promise<boolean>;
}

export abstract class ApplicationRepositoryProviderInterfaceResolver extends ParentRepositoryInterfaceResolver {
  async softDelete(params: { _id: string; operator_id: string }): Promise<Model> {
    throw new Error('Not implemented');
  }
}
