import { RepositoryInterfaceResolver, RepositoryInterface } from '@ilos/common';

declare type Model = any;

export interface ApplicationRepositoryProviderInterface extends RepositoryInterface {
  allByOperator(params: { operator_id: string }): Promise<Model[]>;
  softDelete(params: { _id: string; operator_id: string }): Promise<boolean>;
}

export abstract class ApplicationRepositoryProviderInterfaceResolver extends RepositoryInterfaceResolver {
  async allByOperator(params: { operator_id: string }): Promise<Model[]> {
    throw new Error('Not implemented');
  }
  async softDelete(params: { _id: string; operator_id: string }): Promise<Model> {
    throw new Error('Not implemented');
  }
}
