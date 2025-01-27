import type {
  ResultInterface as LocationResultInterface,
} from "@/pdc/services/observatory/actions/location/LocationAction.ts";
import type { Location as LocationParamsInterface } from "@/pdc/services/observatory/dto/Location.ts";

export type { LocationParamsInterface, LocationResultInterface };

export interface LocationRepositoryInterface {
  getLocation(
    params: LocationParamsInterface,
  ): Promise<LocationResultInterface>;
}

export abstract class LocationRepositoryInterfaceResolver implements LocationRepositoryInterface {
  async getLocation(
    params: LocationParamsInterface,
  ): Promise<LocationResultInterface> {
    throw new Error();
  }
}
