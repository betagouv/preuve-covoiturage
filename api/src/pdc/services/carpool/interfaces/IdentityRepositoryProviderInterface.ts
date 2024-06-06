import { IdentityInterface } from '/shared/common/interfaces/IdentityInterface.ts';

export interface IdentityMetaInterface {
  operator_id: number;
}

export interface findUuidOptions {
  generate?: boolean;
  interval?: number;
}

export interface IdentityRepositoryProviderInterface {
  create(identity: IdentityInterface, meta: IdentityMetaInterface): Promise<{ _id: number; uuid: string }>;
  delete(_id: number): Promise<void>;
  findUuid(identity: IdentityInterface, meta: IdentityMetaInterface, options?: findUuidOptions): Promise<string>;
  findIdentities(identity: IdentityInterface, meta: IdentityMetaInterface): Promise<{ _id: number; uuid: string }[]>;
}

export abstract class IdentityRepositoryProviderInterfaceResolver implements IdentityRepositoryProviderInterface {
  public async create(
    identity: IdentityInterface,
    meta: IdentityMetaInterface,
  ): Promise<{ _id: number; uuid: string }> {
    throw new Error('Not implemented');
  }

  public async delete(_id: number): Promise<void> {
    throw new Error('Not implemented');
  }

  public async findUuid(
    identity: IdentityInterface,
    meta: IdentityMetaInterface,
    options?: findUuidOptions,
  ): Promise<string> {
    throw new Error('Not implemented');
  }

  public async findIdentities(
    identity: IdentityInterface,
    meta: IdentityMetaInterface,
  ): Promise<{ _id: number; uuid: string }[]> {
    throw new Error('Not implemented');
  }
}
