import { UnknownMetaException } from '../exceptions/UnknownMetaException';
import {
  MetadataAccessorInterface,
  MetadataLifetime,
  MetadataRegistryInterface,
  MetadataStoreInterface,
  MetadataVariable,
} from '../interfaces';
import { MetadataAccessor } from './MetadataAccessor';

export class MetadataStore implements MetadataStoreInterface {
  public data: Map<string, MetadataVariable> = new Map();
  async load(registry: MetadataRegistryInterface): Promise<MetadataAccessorInterface> {
    const data = new Map();
    const variables = registry.export();
    const keys = variables.map((v) => v.key);
    const keysToQuery = new Set();
    for (const bkey of keys) {
      const key = `${registry.policy_id.toString()}-${bkey}`;
      if (!this.data.has(key)) {
        keysToQuery.add(key);
      } else {
        data.set(key, this.data.get(key));
      }
    }
    if (keysToQuery.size === 0) {
      return MetadataAccessor.import(registry.datetime, data);
    } else {
      const sqlQuery = '';
      // TODO
      // Use default lifetime AND initialValue || 0
      // Use registry policy_id
    }
  }

  async save(dataAccessor: MetadataAccessorInterface): Promise<void> {
    const data = new Map(Object.entries(dataAccessor.export()));
    for (const uuid of data.keys()) {
      const oldData = this.data.get(uuid);
      if (!oldData) {
        throw new UnknownMetaException();
      }
      this.data.set(uuid, { ...oldData, value: data.get(uuid) });
    }
  }

  async store(lifetime: MetadataLifetime): Promise<Record<string, number>> {
    const dataToSave = new Map();
    for (const uuid of this.data.keys()) {
      const data = this.data.get(uuid);
      if (data.lifetime >= lifetime) {
        dataToSave.set(uuid, this.data.get(uuid).value);
      }
    }
    // perform sql saves
    return Object.fromEntries(dataToSave.entries());
  }
}
