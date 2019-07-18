import * as _ from 'lodash';

import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType, KernelInterfaceResolver, InvalidParamsException } from '@ilos/common';
import { JourneyInterface, PositionInterface } from '@pdc/provider-schema';

// Find the territories where the driver and passenger started and ended their journey

@handler({
  service: 'normalization',
  method: 'territory',
})
export class NormalizationTerritoryAction extends AbstractAction {
  constructor(private kernel: KernelInterfaceResolver) {
    super();
  }

  public async handle(params: { journey: JourneyInterface }, context: ContextType): Promise<void> {
    // duplicate object
    const territoriesEnrichedJourney = { ...params.journey };

    await Promise.all(
      ['passenger.start', 'passenger.end', 'driver.start', 'driver.end'].map(async (path) => {
        const position = _.get(params.journey, path);
        const territories = await this.findTerritories(position, context);
        _.set(territoriesEnrichedJourney, `${path}.territory`, territories);
      }),
    );
  }

  private async findTerritories(position: PositionInterface, context: ContextType): Promise<object> {
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

    throw new InvalidParamsException('Missing INSEE code or lat & lon');
  }
}
