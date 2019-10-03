import { ProviderInterface } from '@ilos/common';

import { GeoInterface } from './GeoInterface';
import { PositionInterface } from './PositionInterface';
import { PointInterface } from './PointInterface';

export interface GeoProviderInterface extends ProviderInterface {
  getTown({ lon, lat, insee, literal }: GeoInterface): Promise<PositionInterface>;
  getRoute(start: PointInterface, end: PointInterface): Promise<{ distance: number; duration: number }>;
}

export abstract class GeoProviderInterfaceResolver implements GeoProviderInterface {
  public async getTown({ lon, lat, insee, literal }: GeoInterface): Promise<PositionInterface> {
    throw new Error('Not implemented');
  }
  public async getRoute(start: PointInterface, end: PointInterface): Promise<{ distance: number; duration: number }> {
    throw new Error('Not implemented');
  }
}
