import { MongoConnection, MongoException, ObjectId, CollectionInterface } from '@ilos/connection-mongo';
import { ConfigInterfaceResolver, provider, NotFoundException } from '@ilos/common';

import {
  CampaignMetadataRepositoryProviderInterface,
  CampaignMetadataRepositoryProviderInterfaceResolver,
} from '../interfaces/CampaignMetadataRepositoryProviderInterface';
import { MetadataWrapper } from './MetadataWrapper';

@provider({
  identifier: CampaignMetadataRepositoryProviderInterfaceResolver,
})
export class CampaignMetadataRepositoryProvider implements CampaignMetadataRepositoryProviderInterface {
  constructor(protected config: ConfigInterfaceResolver, protected connection: MongoConnection) {}

  protected getDbName(): string {
    return this.config.get('campaignMetadata.db');
  }

  protected getCollectionName(): string {
    return this.config.get('campaignMetadata.collectionName');
  }

  protected async getCollection(): Promise<CollectionInterface> {
    return this.connection
      .getClient()
      .db(this.getDbName())
      .collection(this.getCollectionName());
  }

  async get(id: string): Promise<MetadataWrapper> {
    const collection = await this.getCollection();
    const result = await collection.findOne({ _id: new ObjectId(id) });
    return new MetadataWrapper(id, result);
  }

  async set(metadata: MetadataWrapper): Promise<void> {
    const collection = await this.getCollection();
    await collection.updateOne(
      {
        _id: new ObjectId(metadata.id),
      },
      {
        data: metadata.all(),
      },
      {
        upsert: true,
      },
    );
  }
}
