import { SerializedMetaInterface } from '~/enginev2/interfaces';
import { MetadataWrapperInterface } from './MetadataWrapperInterface';

export interface MetadataRepositoryProviderInterface {
  get(id: number, keys?: string[], datetime?: Date): Promise<MetadataWrapperInterface>;
  set(id: number, metadata: MetadataWrapperInterface, date: Date): Promise<void>;
  delete(policyId: number, from?: Date): Promise<void>;
}

export abstract class MetadataRepositoryProviderInterfaceResolver implements MetadataRepositoryProviderInterface {
  async get(id: number, keys?: string[], datetime?: Date): Promise<MetadataWrapperInterface> {
    throw new Error();
  }

  async set(id: number, metadata: MetadataWrapperInterface, date: Date): Promise<void> {
    throw new Error();
  }

  async delete(policyId: number, from?: Date): Promise<void> {
    throw new Error();
  }
}

export abstract class MetadataRepositoryProviderInterfaceResolverV2 {
  async get(policyId: number, keys: string[], datetime?: Date): Promise<SerializedMetaInterface[]> {
    throw new Error();
  }

  async set(data: SerializedMetaInterface[]): Promise<void> {
    throw new Error();
  }
}
