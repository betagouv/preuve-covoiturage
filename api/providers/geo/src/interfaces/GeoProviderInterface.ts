import { Interfaces } from '@ilos/core';

import { GeoInterface } from './GeoInterface';
import { PositionInterface } from './PositionInterface';

export interface GeoProviderInterface extends Interfaces.ProviderInterface{
  boot();
  getTown({ lon, lat, insee, literal }: GeoInterface): Promise<PositionInterface>;
}

export abstract class GeoProviderInterfaceResolver implements GeoProviderInterface{
  async boot() {
    //
  }

  public async getTown({ lon, lat, insee, literal }: GeoInterface): Promise<PositionInterface> {
    throw new Error();
  }
}
