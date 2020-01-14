// tslint:disable:variable-name
import { Action } from '@ilos/core';
import { handler, ContextType } from '@ilos/common';

import { FinalizedPersonInterface } from '../shared/common/interfaces/PersonInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/carpool/crosscheck.contract';
import { alias } from '../shared/carpool/crosscheck.schema';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { CarpoolRepositoryProviderInterfaceResolver } from '../interfaces/CarpoolRepositoryProviderInterface';
import { CrosscheckRepositoryProviderInterfaceResolver } from '../interfaces/CrosscheckRepositoryProviderInterface';
import { IdentityRepositoryProviderInterfaceResolver } from '../interfaces/IdentityRepositoryProviderInterface';

/*
 * Import journey in carpool database
 */
@handler(handlerConfig)
export class CrosscheckAction extends Action {
  public readonly middlewares: ActionMiddleware[] = [
    ['channel.service.only', ['acquisition', 'normalization', handlerConfig.service]],
    ['validate', alias],
  ];

  constructor(
    private carpool: CarpoolRepositoryProviderInterfaceResolver,
    private crosscheck: CrosscheckRepositoryProviderInterfaceResolver,
    private identity: IdentityRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(journey: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    this.logger.debug(`${handlerConfig.service}:${handlerConfig.method}`, journey.acquisition_id);
    const toProcess = [];
    const { people, ...sharedData } = journey;

    const sortedArray = people.sort((p1: FinalizedPersonInterface, p2: FinalizedPersonInterface) =>
      p1.is_driver > p2.is_driver ? 1 : -1,
    );

    const driver = sortedArray[0].is_driver ? sortedArray.shift() : null;
    const passengers = sortedArray;
    // const passengers = people.filter((p) => !p.is_driver);

    let driverIdentity: { _id: number; uuid: string } = null;

    if (driver !== null) {
      driverIdentity = await this.identity.create(driver.identity);
      toProcess.push({ ...driver, identity_id: driverIdentity._id });
    }

    // Get a trip id
    const tripId = await this.crosscheck.getTripId({
      operator_trip_id: journey.operator_trip_id,
      datetime: driver.datetime,
      start: driver.start,
      end: driver.end,
      identity_uuid: driver !== null ? driverIdentity.uuid : null,
    });

    // Build identity for every participant
    for (const passenger of passengers) {
      const { _id: identity_id } = await this.identity.create(passenger.identity);
      toProcess.push({ ...passenger, identity_id });
    }

    // Save carpool into database
    await this.carpool.importFromAcquisition({ ...sharedData, trip_id: tripId }, toProcess);

    return;
  }
}
