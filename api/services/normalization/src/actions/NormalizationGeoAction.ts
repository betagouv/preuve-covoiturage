import { Parents, Container, Types, Interfaces } from '@ilos/core';
import * as _ from 'lodash';
import { GeoProviderInterfaceResolver } from '@pdc/provider-geo';
import { ConfigInterfaceResolver } from '@ilos/config';

import { PositionInterface } from '../interfaces/PositionInterface';
import { Journey } from '../entities/journey';

interface NormalizationGeoParamsInterface {
  journey: Journey;
}

/*
 * Enrich journey with Geo data
 */
@Container.handler({
  service: 'normalization',
  method: 'geo',
})
export class NormalizationGeoAction extends Parents.Action {
  constructor(
    private kernel: Interfaces.KernelInterfaceResolver,
    private geoProvider: GeoProviderInterfaceResolver,
    private config: ConfigInterfaceResolver,
  ) {
    super();
  }

  public async handle(param: NormalizationGeoParamsInterface, context: Types.ContextType): Promise<void> {
    const paths = this.config.get('normalization.positionPaths');

    let normalizedJourney = {};

    await Promise.all(paths.map(async (path) => {
      const position = _.get(param.journey, path);
      const positionEnrichedWithTown = await this.findTown(position);
      normalizedJourney = this.processTownResponse(param.journey, path, position, positionEnrichedWithTown);
    }));

    await this.kernel.notify(
      'normalization:territory',
      {
        journey: normalizedJourney,
      },
      {
        call: {
          ...context.call,
        },
        channel: {
          ...context.channel,
          service: 'normalization',
        },
      },
    );

    return;
  }

  private async findTown(position: PositionInterface): Promise<PositionInterface> {
    const foundPosition = await this.geoProvider.getTown({ lon: position.lon, lat: position.lat, insee: position.insee, literal: position.literal });
    return {
      ...position,
      ...foundPosition,
    };
  }

  /**
   * Complete position with data relative to town
   */
  private processTownResponse(journey, path, position: PositionInterface, determinedPosition: PositionInterface) {
    // console.log(journey, path, position, determinedPosition)
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
