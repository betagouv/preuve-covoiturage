import { MetadataRepositoryProviderInterfaceResolver } from '../../interfaces';
import { UnknownMetaException } from '../exceptions/UnknownMetaException';
import {
  MetadataAccessorInterface,
  MetadataLifetime,
  MetadataRegistryInterface,
  MetadataStoreInterface,
  StoredMetadataVariableInterface,
  SerializedMetadataVariableDefinitionInterface,
  SerializedStoredMetadataInterface,
} from '../interfaces';
import { MetadataAccessor } from './MetadataAccessor';

function getCacheKey(policy_id: number, key: string): string {
  return `${policy_id.toString()}-${key}`;
}
function getDefaultVariableDefinition(
  definition: SerializedMetadataVariableDefinitionInterface,
): SerializedMetadataVariableDefinitionInterface {
  return { initialValue: 0, lifetime: MetadataLifetime.Always, ...definition };
}

export class MetadataStore implements MetadataStoreInterface {
  public cache: Map<string, StoredMetadataVariableInterface> = new Map();

  constructor(protected readonly repository?: MetadataRepositoryProviderInterfaceResolver) {}

  async load(registry: MetadataRegistryInterface): Promise<MetadataAccessorInterface> {
    const variables = registry.export();
    const keys = variables.map((v) => v.key);
    const keysToQuery = keys.filter((k) => !this.cache.has(getCacheKey(registry.policy_id, k)));
    const missingData = (await this.repository?.get(registry.policy_id, keysToQuery, registry.datetime)) || [];
    for (const key of keysToQuery) {
      const variableDefinition = getDefaultVariableDefinition(variables.find((v) => v.key === key));
      const value = missingData.find((k) => k.key === key)?.value || variableDefinition.initialValue || 0;
      this.cache.set(getCacheKey(registry.policy_id, key), {
        ...variableDefinition,
        policy_id: registry.policy_id,
        datetime: registry.datetime,
        value,
      });
    }
    return MetadataAccessor.import(
      registry.datetime,
      keys
        .map((k) => this.cache.get(getCacheKey(registry.policy_id, k)))
        .reduce((m, i) => {
          m.set(i.uuid, { policy_id: i.policy_id, key: i.key, value: i.value });
          return m;
        }, new Map()),
    );
  }

  async save(dataAccessor: MetadataAccessorInterface): Promise<void> {
    const data = dataAccessor.export();
    for (const { key, value, policy_id } of data) {
      const cacheKey = getCacheKey(policy_id, key);
      const oldData = this.cache.get(cacheKey);
      if (!oldData) {
        throw new UnknownMetaException();
      }
      this.cache.set(cacheKey, { ...oldData, value });
    }
  }

  async store(lifetime: MetadataLifetime): Promise<Array<SerializedStoredMetadataInterface>> {
    const dataToSave: Array<SerializedStoredMetadataInterface> = [];
    for (const uuid of this.cache.keys()) {
      const data = this.cache.get(uuid);
      if (data.lifetime >= lifetime) {
        dataToSave.push({
          policy_id: data.policy_id,
          datetime: data.datetime,
          key: data.key,
          value: data.value,
        });
      }
    }
    await this.repository?.set(dataToSave);
    return dataToSave;
  }
}
