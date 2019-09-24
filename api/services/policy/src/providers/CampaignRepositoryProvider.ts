import { MongoConnection, MongoException, ObjectId } from '@ilos/connection-mongo';
import { ConfigInterfaceResolver, provider, NotFoundException } from '@ilos/common';
import { ParentRepository } from '@ilos/repository';

import {
  CampaignRepositoryProviderInterface,
  CampaignRepositoryProviderInterfaceResolver,
} from '../interfaces/CampaignRepositoryProviderInterface';

@provider({
  identifier: CampaignRepositoryProviderInterfaceResolver,
})
export class CampaignRepositoryProvider extends ParentRepository implements CampaignRepositoryProviderInterface {
  protected readonly castObjectIds: string[] = ['_id', 'territory_id', 'parent_id'];

  constructor(protected config: ConfigInterfaceResolver, protected mongoProvider: MongoConnection) {
    super(config, mongoProvider);
  }

  public getKey(): string {
    return this.config.get('campaign.collectionName');
  }

  public getDbName(): string {
    return this.config.get('campaign.db');
  }

  async patchWhereTerritory(id: string, territoryId: string, patch: any): Promise<any> {
    const castedPatch = this.castObjectIdFromString(patch);
    const collection = await this.getCollection();
    const result = await collection.findOneAndUpdate(
      {
        _id: new ObjectId(id),
        territory_id: new ObjectId(territoryId),
        status: 'draft',
      },
      {
        $set: castedPatch,
      },
      {
        returnOriginal: false,
      },
    );
    if (result.ok !== 1) {
      throw new MongoException();
    }
    return this.instanciate(result.value);
  }

  async findOneWhereTerritory(id: string, territoryId: string): Promise<any> {
    const collection = await this.getCollection();
    const result = await collection.findOne({
      _id: new ObjectId(id),
      territory_id: new ObjectId(territoryId),
    });

    if (!result) throw new NotFoundException('id not found');
    return this.instanciate(result);
  }

  async findWhereTerritory(territoryId: string): Promise<any[]> {
    const collection = await this.getCollection();
    const results = await collection
      .find({
        territory_id: new ObjectId(territoryId),
      })
      .toArray();
    return this.instanciateMany(results);
  }

  async findTemplates(territoryId: string | null = null): Promise<any[]> {
    const collection = await this.getCollection();
    const query = {
      status: 'template',
      territory_id: null,
    };

    if (territoryId) {
      query.territory_id = new ObjectId(territoryId);
    }

    const results = await collection.find(query).toArray();
    return this.instanciateMany(results);
  }

  async deleteDraftOrTemplate(id: string, territoryId: string): Promise<void> {
    const collection = await this.getCollection();
    const results = await collection.deleteOne({
      status: {
        $in: ['draft', 'template'],
      },
      _id: new ObjectId(id),
      territory_id: new ObjectId(territoryId),
    });

    if (results.deletedCount !== 1) {
      throw new NotFoundException();
    }

    return;
  }
}
