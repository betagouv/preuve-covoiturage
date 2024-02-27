import { SerializedStoredMetadataInterface } from '..';

export abstract class MetadataRepositoryProviderInterfaceResolver {
  abstract get(policyId: number, keys: string[], datetime?: Date): Promise<SerializedStoredMetadataInterface[]>;
  abstract set(data: SerializedStoredMetadataInterface[]): Promise<void>;
}
