import { MetadataRepositoryProviderInterfaceResolver, MetadataWrapperInterface } from '../../interfaces';
import { MetadataWrapper } from '../../providers/MetadataWrapper';

export class InMemoryMetadataProvider extends MetadataRepositoryProviderInterfaceResolver {
  protected metamap: Map<number, MetadataWrapperInterface> = new Map();

  async get(id: number, keys = ['default']): Promise<MetadataWrapperInterface> {
    if (!this.metamap.has(id)) {
      await this.set(id, new MetadataWrapper(id, []));
    }
    return this.metamap.get(id);
  }

  async set(id: number, meta: MetadataWrapperInterface): Promise<void> {
    this.metamap.set(id, meta);
  }
}
