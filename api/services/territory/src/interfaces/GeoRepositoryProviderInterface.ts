import { ParamsInterface as ListGeoParamsInterface, ResultInterface as ListGeoResultInterface } from '../shared/territory/listGeo.contract';

import {
  ParamsInterface as FindByInseeParamsInterface,
  ResultInterface as FindByInseeResultInterface,
} from '../shared/territory/findGeoByCode.contract';

export {
  ListGeoParamsInterface,
  ListGeoResultInterface,
};
export interface GeoRepositoryProviderInterface {
  list(params: ListGeoParamsInterface): Promise<ListGeoResultInterface>;
  findByCodes(params: FindByInseeParamsInterface): Promise<FindByInseeResultInterface>;
}

export abstract class GeoRepositoryProviderInterfaceResolver implements GeoRepositoryProviderInterface {
  async list(params: ListGeoParamsInterface): Promise<ListGeoResultInterface> {
    throw new Error();
  }

  async findByCodes(params: FindByInseeParamsInterface): Promise<FindByInseeResultInterface> {
    throw new Error();
  }
}
