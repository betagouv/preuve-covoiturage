import { MetadataRepositoryProviderInterfaceResolver, SerializedStoredMetadataInterface } from '../interfaces/index.ts';

export class MemoryMetadataRepository implements MetadataRepositoryProviderInterfaceResolver {
  constructor(public data: SerializedStoredMetadataInterface[] = []) {}

  async get(policyId: number, keys: string[], datetime?: Date): Promise<SerializedStoredMetadataInterface[]> {
    return null;
  }

  async set(data: SerializedStoredMetadataInterface[]): Promise<void> {}
}
