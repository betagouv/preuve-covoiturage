import { MetaInterface } from './RuleInterfaces';

export interface CampaignMetadataRepositoryProviderInterface {
  get(id: number): Promise<MetaInterface>;
  set(metadata: MetaInterface): Promise<void>;
}

export abstract class CampaignMetadataRepositoryProviderInterfaceResolver {
  async get(id: number): Promise<MetaInterface> {
    throw new Error();
  }

  async set(metadata: MetaInterface): Promise<void> {
    throw new Error();
  }
}
