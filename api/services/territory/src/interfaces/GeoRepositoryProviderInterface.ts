import {
  ParamsInterface as FindBySirenParamsInterface,
  ResultInterface as FindBySirenResultInterface,
} from '../shared/territory/findGeoBySiren.contract';
import {
  ParamsInterface as ListGeoParamsInterface,
  ResultInterface as ListGeoResultInterface,
} from '../shared/territory/listGeo.contract';

export { ListGeoParamsInterface, ListGeoResultInterface };
export interface GeoRepositoryProviderInterface {
  list(params: ListGeoParamsInterface): Promise<ListGeoResultInterface>;
  findBySiren(params: FindBySirenParamsInterface): Promise<FindBySirenResultInterface>;
}

export abstract class GeoRepositoryProviderInterfaceResolver implements GeoRepositoryProviderInterface {
  async list(params: ListGeoParamsInterface): Promise<ListGeoResultInterface> {
    throw new Error();
  }

  async findBySiren(params: FindBySirenParamsInterface): Promise<FindBySirenResultInterface> {
    throw new Error();
  }
}
