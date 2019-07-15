import { ProviderInterface } from '@ilos/common';

import { GeoInterface } from './GeoInterface';
import { PositionInterface } from './PositionInterface';

export interface GeoProviderInterface extends ProviderInterface {
  getTown({ lon, lat, insee, literal }: GeoInterface): Promise<PositionInterface>;
}

export abstract class GeoProviderInterfaceResolver implements GeoProviderInterface {
  public async getTown({ lon, lat, insee, literal }: GeoInterface): Promise<PositionInterface> {
    throw new Error();
  }
}
