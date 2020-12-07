import { MetadataProviderInterfaceResolver, MetaInterface } from '../interfaces';
import { MetadataWrapper } from '../meta/MetadataWrapper';

export class InMemoryMetadataProvider extends MetadataProviderInterfaceResolver {
  protected metamap: Map<number, MetaInterface> = new Map();

  async get(id: number, keys = ['default']): Promise<MetaInterface> {
    if (!this.metamap.has(id)) {
      await this.set(id, new MetadataWrapper(id, []));
    }
    return this.metamap.get(id);
  }

  async set(id: number, meta: MetaInterface): Promise<void> {
    this.metamap.set(id, meta);
  }
}
