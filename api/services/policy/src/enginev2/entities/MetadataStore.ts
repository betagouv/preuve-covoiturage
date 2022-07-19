import { MetadataRepositoryProviderInterfaceResolverV2 } from '../../interfaces';
import { UnknownMetaException } from '../exceptions/UnknownMetaException';
import {
  MetadataAccessorInterface,
  MetadataLifetime,
  MetadataRegistryInterface,
  MetadataStoreInterface,
  MetadataVariable,
  SerializedMetaInterface,
} from '../interfaces';
import { MetadataAccessor } from './MetadataAccessor';

export class MetadataStore implements MetadataStoreInterface {
  public cache: Map<string, MetadataVariable> = new Map();

  constructor(protected readonly repository?: MetadataRepositoryProviderInterfaceResolverV2) {}

  async load(registry: MetadataRegistryInterface): Promise<MetadataAccessorInterface> {
    const variables = registry.export();
    const keys = variables.map((v) => v.key);
    const keysToQuery = keys.filter((k) => !this.cache.has(`${registry.policy_id}-${k}`));
    const missingData = (await this.repository?.get(registry.policy_id, keysToQuery, registry.datetime)) || [];
    for (const key of keysToQuery) {
      const variableDefinition = variables.find((v) => v.key === key);
      const value = missingData.find((k) => k.key === key)?.value || variableDefinition.initialValue || 0;
      this.cache.set(`${registry.policy_id.toString()}-${key}`, {
        ...variableDefinition,
        policy_id: registry.policy_id,
        datetime: registry.datetime,
        value,
      });
    }
    return MetadataAccessor.import(
      registry.datetime,
      keys
        .map((k) => this.cache.get(k))
        .reduce((m, i) => {
          m.set(i.uuid, i);
          return m;
        }, new Map()),
    );
  }

  async save(dataAccessor: MetadataAccessorInterface): Promise<void> {
    const data = dataAccessor.export();
    for (const { key, value } of data) {
      const oldData = this.cache.get(key);
      if (!oldData) {
        throw new UnknownMetaException();
      }
      this.cache.set(key, { ...oldData, value });
    }
  }

  async store(lifetime: MetadataLifetime): Promise<Array<SerializedMetaInterface>> {
    const dataToSave: Array<SerializedMetaInterface> = [];
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
