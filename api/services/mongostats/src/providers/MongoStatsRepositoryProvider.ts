import { provider, ConfigInterfaceResolver } from '@ilos/common';
import { MongoConnection } from '@ilos/connection-mongo';
import { ParentRepository } from '@ilos/repository';

import {
  MongostatsRepositoryProviderInterfaceResolver,
  MongostatsRepositoryProviderInterface,
} from '../interfaces/MongostatsRepositoryProviderInterface';

/*
 * Trip specific repository
 */
@provider({
  identifier: MongostatsRepositoryProviderInterfaceResolver,
})
export class MongostatsRepositoryProvider extends ParentRepository implements MongostatsRepositoryProviderInterface {
  constructor(protected config: ConfigInterfaceResolver, protected connection: MongoConnection) {
    super(config, connection);
  }

  async list(): Promise<any[]> {
    return this.connection
      .getClient()
      .db(this.config.get('mongostats.db'))
      .collection(this.config.get('mongostats.collectionName'))
      .find({})
      .toArray();
  }
}
