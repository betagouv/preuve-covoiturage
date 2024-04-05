import { ResultInterface as AllGeoResultInterface } from '@shared/territory/allGeo.contract';
import {
  ParamsInterface as FindBySirenParamsInterface,
  ResultInterface as FindBySirenResultInterface,
} from '@shared/territory/findGeoBySiren.contract';
import {
  ParamsInterface as ListGeoParamsInterface,
  ResultInterface as ListGeoResultInterface,
} from '@shared/territory/listGeo.contract';

export interface GeoRepositoryProviderInterface {
  getAllGeo(): Promise<AllGeoResultInterface>;
  list(params: ListGeoParamsInterface): Promise<ListGeoResultInterface>;
  findBySiren(params: FindBySirenParamsInterface): Promise<FindBySirenResultInterface>;
}

export abstract class GeoRepositoryProviderInterfaceResolver implements GeoRepositoryProviderInterface {
  async getAllGeo(): Promise<AllGeoResultInterface> {
    throw new Error('Not implemented');
  }
  async list(params: ListGeoParamsInterface): Promise<ListGeoResultInterface> {
    throw new Error('Not implemented');
  }
  async findBySiren(params: FindBySirenParamsInterface): Promise<FindBySirenResultInterface> {
    throw new Error('Not implemented');
  }
}
