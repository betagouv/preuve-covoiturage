import { Parents, Container, Exceptions, Types, Interfaces } from '@ilos/core';


/*
 * Process journey through normalization pipe
 */
@Container.handler({
  service: 'normalization',
  method: 'process',
})
export class NormalizationProcessAction extends Parents.Action {
  constructor(
    private kernel: Interfaces.KernelInterfaceResolver,
  ) {
    super();
  }

  public async handle(request: Types.ParamsType, context: Types.ContextType): Promise<void> {
    const safeJourney = request.safeJourney;

    const geoEnrichedJourney = await this.kernel.call(
      'normalization:geo',
      {
       journey: safeJourney,
      },
      {
        call: context.call,
        channel: {
          ...context.channel,
          service: 'normalization',
        },
      },
    );

    const theoreticTravelEnrichedJourney = await this.kernel.call(
      'normalization:theoreticTravel',
      {
        journey: geoEnrichedJourney,
      },
      {
        call: context.call,
        channel: {
          ...context.channel,
          service: 'normalization',
        },
      },
    );

    const aomEnrichedJourney = await this.kernel.call(
      'normalization:aom',
      {
        journey: theoreticTravelEnrichedJourney,
      },
      {
        call: context.call,
        channel: {
          ...context.channel,
          service: 'normalization',
        },
      },
    );

    // call cross check/merge


  }
}
