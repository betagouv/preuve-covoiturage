import { IdentityInterface } from '../shared/common/interfaces/IdentityInterface';

export interface IdentityMetaInterface {
  operator_id: number;
}

export interface IdentityRepositoryProviderInterface {
  create(identity: IdentityInterface, meta: IdentityMetaInterface): Promise<{ _id: number; uuid: string }>;
  delete(_id: number): Promise<void>;
}

export abstract class IdentityRepositoryProviderInterfaceResolver implements IdentityRepositoryProviderInterface {
  public async create(
    identity: IdentityInterface,
    meta: IdentityMetaInterface,
  ): Promise<{ _id: number; uuid: string }> {
    throw new Error();
  }

  public async delete(_id: number): Promise<void> {
    throw new Error();
  }
}
