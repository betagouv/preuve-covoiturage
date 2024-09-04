import { Action } from "@/ilos/core/index.ts";
import { ConfigInterfaceResolver, handler } from "@/ilos/common/index.ts";
import { internalOnlyMiddlewares } from "@/pdc/providers/middleware/index.ts";

import { FinalizedPersonInterface } from "@/shared/common/interfaces/PersonInterface.ts";
import {
  handlerConfig,
  ParamsInterface,
  ResultInterface,
} from "@/shared/carpool/crosscheck.contract.ts";
import { alias } from "@/shared/carpool/crosscheck.schema.ts";
import { CarpoolRepositoryProviderInterfaceResolver } from "../interfaces/CarpoolRepositoryProviderInterface.ts";
import { CrosscheckRepositoryProviderInterfaceResolver } from "../interfaces/CrosscheckRepositoryProviderInterface.ts";
import { IdentityRepositoryProviderInterfaceResolver } from "../interfaces/IdentityRepositoryProviderInterface.ts";
import { PeopleWithIdInterface } from "../interfaces/Carpool.ts";
import { getStatus } from "../helpers/getStatus.ts";

/*
 * Import journey in carpool database
 */
@handler({
  ...handlerConfig,
  middlewares: [
    ...internalOnlyMiddlewares("acquisition", handlerConfig.service),
    ["validate", alias],
  ],
})
export class CrosscheckAction extends Action {
  constructor(
    private carpool: CarpoolRepositoryProviderInterfaceResolver,
    private crosscheck: CrosscheckRepositoryProviderInterfaceResolver,
    private identity: IdentityRepositoryProviderInterfaceResolver,
    private config: ConfigInterfaceResolver,
  ) {
    super();
  }

  public async handle(journey: ParamsInterface): Promise<ResultInterface> {
    const toProcess: PeopleWithIdInterface[] = [];
    const { people, ...sharedData } = journey;

    const sortedArray = people.sort((
      p1: FinalizedPersonInterface,
      p2: FinalizedPersonInterface,
    ) => p1.is_driver > p2.is_driver ? 1 : -1);

    const driverInd = sortedArray.findIndex((user) => user.is_driver);

    const passengers = [...sortedArray];
    const driver = driverInd !== -1 ? passengers.splice(driverInd, 1)[0] : null;

    let driverIdentity: { _id: number; uuid: string } = null;

    if (driver) {
      driverIdentity = await this.identity.create(driver.identity, sharedData);
      toProcess.push({ ...driver, identity_id: driverIdentity._id });
    }

    // Get a trip id
    const tripId = await this.crosscheck.getTripId({
      operator_trip_id: journey.operator_trip_id,
      datetime: sortedArray[0].datetime,
      start: sortedArray[0].start,
      end: sortedArray[0].end,
      identity_uuid: driver !== null ? driverIdentity.uuid : null,
    });

    // Build identity for every participant
    for (const passenger of passengers) {
      const { _id: identity_id } = await this.identity.create(
        passenger.identity,
        sharedData,
      );
      toProcess.push({ ...passenger, identity_id });
    }

    // Save carpool into database
    await this.carpool.importFromAcquisition(
      {
        ...sharedData,
        trip_id: tripId,
        status: getStatus(
          sharedData.created_at,
          toProcess.map((e) => e.datetime),
          this.config.get("rules.maxAge"),
        ),
      },
      toProcess,
    );

    return;
  }
}
