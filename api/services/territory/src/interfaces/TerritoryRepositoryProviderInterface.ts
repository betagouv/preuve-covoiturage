import { RepositoryInterface, RepositoryInterfaceResolver } from '@ilos/common';

import { Territory } from '../entities/Territory';
export interface TerritoryRepositoryProviderInterface extends RepositoryInterface {
  findByInsee(insee: String): Promise<Territory>;

  findByPosition(lon: Number, lat: Number): Promise<Territory>;
}

export abstract class TerritoryRepositoryProviderInterfaceResolver extends RepositoryInterfaceResolver {
  async findByInsee(insee: String): Promise<Territory> {
    throw new Error();
  }

  async findByPosition(lon: Number, lat: Number): Promise<Territory> {
    throw new Error();
  }
}
