import { OperatorInterface } from '@/shared/operator/common/interfaces/OperatorInterface.ts';
import { OperatorDbInterface } from '@/shared/operator/common/interfaces/OperatorDbInterface.ts';
import { OperatorListInterface } from '@/shared/operator/common/interfaces/OperatorListInterface.ts';
import { ResultInterface as FindBySiretResultInterface } from '@/shared/operator/findbyuuid.contract.ts';
export interface OperatorRepositoryProviderInterface {
  find(id: number): Promise<OperatorDbInterface>;
  quickFind(
    _id: number,
    withThumbnail: boolean,
  ): Promise<{ uuid: string; name: string; support: string; thumbnail?: string }>;
  all(): Promise<OperatorListInterface[]>;
  create(data: OperatorInterface): Promise<OperatorDbInterface>;
  delete(_id: number): Promise<void>;
  patch(id: number, patch: { [k: string]: any }): Promise<OperatorDbInterface>;
  update(data: OperatorDbInterface): Promise<OperatorDbInterface>;
  patchThumbnail(operator_id: number, base64Thumbnail: string): Promise<void>;
}

export abstract class OperatorRepositoryProviderInterfaceResolver implements OperatorRepositoryProviderInterface {
  async find(id: number, withThumbnail?: boolean): Promise<OperatorDbInterface> {
    throw new Error('Not implemented');
  }

  public async patchThumbnail(operator_id: number, base64Thumbnail: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async quickFind(
    _id: number,
    withThumbnail: boolean,
  ): Promise<{ uuid: string; name: string; support: string; thumbnail?: string }> {
    throw new Error('Not implemented');
  }

  async findByUuid(siret: string[]): Promise<FindBySiretResultInterface> {
    throw new Error('Not implemented');
  }

  async all(): Promise<OperatorListInterface[]> {
    throw new Error('Not implemented');
  }
  async create(data: OperatorInterface): Promise<OperatorDbInterface> {
    throw new Error('Not implemented');
  }
  async delete(_id: number): Promise<void> {
    throw new Error('Not implemented');
  }
  async patch(id: number, patch: { [k: string]: any }): Promise<OperatorDbInterface> {
    throw new Error('Not implemented');
  }
  async update(data: OperatorDbInterface): Promise<OperatorDbInterface> {
    throw new Error('Not implemented');
  }
}
