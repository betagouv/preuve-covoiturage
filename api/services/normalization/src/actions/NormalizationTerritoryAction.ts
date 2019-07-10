import { Parents, Container, Types, Interfaces, Exceptions } from '@ilos/core';
import * as _ from 'lodash';
import { GeoProviderInterfaceResolver } from '@pdc/provider-geo';
import { ConfigInterfaceResolver } from '@ilos/config';

import { PositionInterface } from '../interfaces/PositionInterface';

interface NormalizationTerritoryParamsInterface {
  journey: any;
}

/*
 * Enrich journey with Territories
 */
@Container.handler({
  service: 'normalization',
  method: 'territory',
})
export class NormalizationTerritoryAction extends Parents.Action {
  constructor(
    private kernel: Interfaces.KernelInterfaceResolver,
    private geoProvider: GeoProviderInterfaceResolver,
    private config: ConfigInterfaceResolver,
  ) {
    super();
  }

  public async handle(param: NormalizationTerritoryParamsInterface, context: Types.ContextType): Promise<void> {
    const paths = this.config.get('normalization.positionPaths');

    const territoriesEnrichedJourney = {
      ...param.journey,
    };

    await Promise.all(
      paths.map(async (path) => {
        const position = _.get(param.journey, path);
        const territories = await this.findTerritories(position, context);
        _.set(territoriesEnrichedJourney, `${path}.territories`, territories);
      }),
    );

    // await this.kernel.notify( // todo: should be notify
    //   'crosscheck:process',
    //   {
    //     journey: territoriesEnrichedJourney,
    //   },
    //   {
    //     call: context.call,
    //     channel: {
    //       ...context.channel,
    //       service: 'normalization',
    //     },
    //   },
    // );

    return;
  }

  public async findTerritories(position: PositionInterface, context: Types.ContextType): Promise<object> {
    if ('insee' in position) {
      return this.kernel.call(
        'territory:findByInsee',
        {
          insee: position.insee,
        },
        {
          call: context.call,
          channel: {
            ...context.channel,
            service: 'normalization',
          },
        },
      );
    }
    if ('lat' in position && 'lon' in position) {
      return this.kernel.call(
        'territory:findByLatLon',
        {
          lat: position.lat,
          lon: position.lon,
        },
        {
          call: context.call,
          channel: {
            ...context.channel,
            service: 'normalization',
          },
        },
      );
    }
    throw new Exceptions.InvalidParamsException('missing insee or lat & lon');
  }
}
