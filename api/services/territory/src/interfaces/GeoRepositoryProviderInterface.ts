import {
  ParamsInterface as FindBySirenParamsInterface,
  ResultInterface as FindBySirenResultInterface,
} from '../shared/territory/findGeoBySiren.contract';
import {
  ParamsInterface as ListGeoParamsInterface,
  ResultInterface as ListGeoResultInterface,
} from '../shared/territory/findGeoByName.contract';

import {
  ResultInterface as FindGeoByCodeInterface,
  ParamsInterface as FindGeoByCodeParamsInterface,
} from '../shared/territory/findGeoByCode.contract';

export { ListGeoParamsInterface, ListGeoResultInterface };

export interface GeoRepositoryProviderInterface {
  findByName(params: ListGeoParamsInterface): Promise<ListGeoResultInterface>;
  findOneWithComsBySiren(params: FindBySirenParamsInterface): Promise<FindBySirenResultInterface>;
  findByCode(params: FindGeoByCodeParamsInterface): Promise<FindGeoByCodeInterface>;
}

export abstract class GeoRepositoryProviderInterfaceResolver implements GeoRepositoryProviderInterface {
  async findByName(params: ListGeoParamsInterface): Promise<ListGeoResultInterface> {
    throw new Error();
  }

  async findOneWithComsBySiren(params: FindBySirenParamsInterface): Promise<FindBySirenResultInterface> {
    throw new Error();
  }
  async findByCode(params: FindGeoByCodeParamsInterface): Promise<FindGeoByCodeInterface> {
    throw new Error();
  }
}
