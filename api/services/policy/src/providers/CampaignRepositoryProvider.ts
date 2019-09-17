import { ConfigInterfaceResolver, provider } from '@ilos/common';
import { MongoConnection } from '@ilos/connection-mongo';
import { ParentRepository } from '@ilos/repository';

import {
  CampaignRepositoryProviderInterface,
  CampaignRepositoryProviderInterfaceResolver,
} from '../interfaces/CampaignRepositoryProviderInterface';

@provider({
  identifier: CampaignRepositoryProviderInterfaceResolver,
})
export class CampaignRepositoryProvider extends ParentRepository implements CampaignRepositoryProviderInterface {
  constructor(protected config: ConfigInterfaceResolver, protected mongoProvider: MongoConnection) {
    super(config, mongoProvider);
  }

  public getKey(): string {
    return this.config.get('campaign.collectionName');
  }

  public getDbName(): string {
    return this.config.get('campaign.db');
  }
}
