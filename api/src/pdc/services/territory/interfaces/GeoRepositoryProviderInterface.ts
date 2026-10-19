import {
  ParamsInterface as FindBySirenParamsInterface,
  ResultInterface as FindBySirenResultInterface,
} from "@/pdc/services/territory/contracts/findGeoBySiren.contract.ts";

export interface GeoRepositoryProviderInterface {
  findBySiren(
    params: FindBySirenParamsInterface,
  ): Promise<FindBySirenResultInterface>;
}

export abstract class GeoRepositoryProviderInterfaceResolver implements GeoRepositoryProviderInterface {
  async findBySiren(
    params: FindBySirenParamsInterface,
  ): Promise<FindBySirenResultInterface> {
    throw new Error("Not implemented");
  }
}
