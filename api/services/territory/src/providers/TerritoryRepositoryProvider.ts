import { provider, ConfigInterfaceResolver, NotFoundException } from '@ilos/common';
import { ParentRepository } from '@ilos/repository';
import { MongoConnection } from '@ilos/connection-mongo';

import { Territory } from '../entities/Territory';
import {
  TerritoryRepositoryProviderInterface,
  TerritoryRepositoryProviderInterfaceResolver,
} from '../interfaces/TerritoryRepositoryProviderInterface';

@provider({
  identifier: TerritoryRepositoryProviderInterfaceResolver,
})
export class TerritoryRepositoryProvider extends ParentRepository implements TerritoryRepositoryProviderInterface {
  constructor(protected config: ConfigInterfaceResolver, protected mongoProvider: MongoConnection) {
    super(config, mongoProvider);
  }

  public getKey(): string {
    return this.config.get('territory.collectionName');
  }

  public getDbName(): string {
    return this.config.get('territory.db');
  }

  public getModel() {
    return Territory;
  }

  /**
   * Find a terroritory by insee.
   */
  async findByInsee(insee: String): Promise<Territory> {
    const collection = await this.getCollection();
    const result = await collection.findOne({ insee });
    if (!result) throw new NotFoundException(`Territory not found (insee: ${JSON.stringify(insee)})`);
    return this.instanciate(result);
  }

  /**
   * Find a terroritory by position (lon, lat).
   */
  async findByPosition(lon: Number, lat: Number): Promise<Territory> {
    const collection = await this.getCollection();
    const result = await collection.findOne({
      geometry: {
        $geoIntersects: {
          $geometry: {
            type: 'Point',
            coordinates: [lon, lat],
          },
        },
      },
    });
    if (!result) throw new NotFoundException(`Territory not found (lon: ${lon}, lat: ${lat})`);
    return this.instanciate(result);
  }
}
