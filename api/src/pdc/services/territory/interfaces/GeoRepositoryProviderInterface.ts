import { ResultInterface as AllGeoResultInterface } from "@/pdc/services/territory/contracts/allGeo.contract.ts";
import {
  ParamsInterface as FindBySirenParamsInterface,
  ResultInterface as FindBySirenResultInterface,
} from "@/pdc/services/territory/contracts/findGeoBySiren.contract.ts";
import {
  ParamsInterface as ListGeoParamsInterface,
  ResultInterface as ListGeoResultInterface,
} from "@/pdc/services/territory/contracts/listGeo.contract.ts";

export interface GeoRepositoryProviderInterface {
  getAllGeo(): Promise<AllGeoResultInterface>;
  list(params: ListGeoParamsInterface): Promise<ListGeoResultInterface>;
  findBySiren(
    params: FindBySirenParamsInterface,
  ): Promise<FindBySirenResultInterface>;
}

export abstract class GeoRepositoryProviderInterfaceResolver implements GeoRepositoryProviderInterface {
  async getAllGeo(): Promise<AllGeoResultInterface> {
    throw new Error("Not implemented");
  }
  async list(params: ListGeoParamsInterface): Promise<ListGeoResultInterface> {
    throw new Error("Not implemented");
  }
  async findBySiren(
    params: FindBySirenParamsInterface,
  ): Promise<FindBySirenResultInterface> {
    throw new Error("Not implemented");
  }
}
