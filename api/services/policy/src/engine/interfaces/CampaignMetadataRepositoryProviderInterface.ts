import { MetaInterface } from './MetaInterface';

export interface CampaignMetadataRepositoryProviderInterface {
  get(id: number, keys?: string[]): Promise<MetaInterface>;
  set(metadata: MetaInterface): Promise<void>;
}

export abstract class CampaignMetadataRepositoryProviderInterfaceResolver {
  async get(id: number, keys?: string[]): Promise<MetaInterface> {
    throw new Error();
  }

  async set(metadata: MetaInterface): Promise<void> {
    throw new Error();
  }
}
