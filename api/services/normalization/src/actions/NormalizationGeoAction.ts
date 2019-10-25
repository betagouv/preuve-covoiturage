import * as _ from 'lodash';
import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType } from '@ilos/common';
import { GeoProviderInterfaceResolver } from '@pdc/provider-geo';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/normalization/geo.contract';
import { PositionInterface } from '../shared/common/interfaces/PositionInterface';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { WorkflowProvider } from '../providers/WorkflowProvider';

// Enrich position data
@handler(handlerConfig)
export class NormalizationGeoAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [['channel.transport', ['queue']]];

  constructor(protected wf: WorkflowProvider, private geoProvider: GeoProviderInterfaceResolver) {
    super();
  }

  public async handle(journey: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    let normalizedJourney = { ...journey };
    this.logger.debug(`Normalization:geo on ${journey._id}`);

    for (const path of ['passenger.start', 'passenger.end', 'driver.start', 'driver.end']) {
      const position = _.get(journey, path);
      const positionEnrichedWithTown = await this.findTown(position);
      normalizedJourney = this.processTownResponse(journey, path, position, positionEnrichedWithTown);
    }

    // Call the next step asynchronously
    await this.wf.next('normalization:geo', normalizedJourney);

    return normalizedJourney;
  }

  private async findTown(position: PositionInterface): Promise<PositionInterface> {
    const foundPosition = await this.geoProvider.getTown({
      lon: position.lon,
      lat: position.lat,
      insee: position.insee,
      literal: position.literal,
    });
    return {
      ...position,
      ...foundPosition,
    };
  }

  /**
   * Complete position with data relative to town
   */
  private processTownResponse(
    journey: ParamsInterface,
    path: string,
    position: PositionInterface,
    determinedPosition: PositionInterface,
  ): ParamsInterface {
    if (determinedPosition.lon && !position.lon) {
      position.lon = determinedPosition.lon;
      _.set(journey, `${path}.lon`, determinedPosition.lon);
    }

    if (determinedPosition.lat && !position.lat) {
      position.lat = determinedPosition.lat;
      _.set(journey, `${path}.lat`, determinedPosition.lat);
    }

    if (determinedPosition.insee && !position.insee) {
      position.insee = determinedPosition.insee;
      _.set(journey, `${path}.insee`, determinedPosition.insee);
    }

    if (determinedPosition.town && !position.town) {
      position.town = determinedPosition.town;
      _.set(journey, `${path}.town`, determinedPosition.town);
    }

    if (determinedPosition.country && !position.country) {
      position.country = determinedPosition.country;
      _.set(journey, `${path}.country`, determinedPosition.country);
    }

    // concat postcodes with existing ones
    const pcs = _.get(journey, `${path}.postcodes`, []).concat(determinedPosition.postcodes);
    position.postcodes = _.uniq(pcs);
    _.set(journey, `${path}.postcodes`, position.postcodes);

    return journey;
  }
}
