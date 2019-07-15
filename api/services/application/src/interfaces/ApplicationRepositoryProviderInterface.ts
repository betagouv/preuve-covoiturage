import { ParentRepositoryInterface, ParentRepositoryInterfaceResolver } from '@ilos/repository';

declare type Model = any;

export interface ApplicationRepositoryProviderInterface extends ParentRepositoryInterface {
  allByOperator(params: { operator_id: string }): Promise<Model[]>;
  softDelete(params: { _id: string; operator_id: string }): Promise<boolean>;
}

export abstract class ApplicationRepositoryProviderInterfaceResolver extends ParentRepositoryInterfaceResolver {
  async allByOperator(params: { operator_id: string }): Promise<Model[]> {
    throw new Error('Not implemented');
  }
  async softDelete(params: { _id: string; operator_id: string }): Promise<Model> {
    throw new Error('Not implemented');
  }
}
