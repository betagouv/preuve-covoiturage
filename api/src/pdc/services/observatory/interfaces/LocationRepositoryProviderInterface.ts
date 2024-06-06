import type {
  ParamsInterface as LocationParamsInterface,
  ResultInterface as LocationResultInterface,
  SqlResultInterface as LocationSqlResultInterface,
} from '@/shared/observatory/location/location.contract.ts';

export type { LocationParamsInterface, LocationResultInterface, LocationSqlResultInterface };

export interface LocationRepositoryInterface {
  getLocation(params: LocationParamsInterface): Promise<LocationResultInterface>;
}

export abstract class LocationRepositoryInterfaceResolver implements LocationRepositoryInterface {
  async getLocation(params: LocationParamsInterface): Promise<LocationResultInterface> {
    throw new Error();
  }
}
