import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType, KernelInterfaceResolver } from '@ilos/common';
import { CreateJourneyParamsInterface } from '@pdc/provider-schema';

import { mapLegacyToLatest } from '../helpers/mapLegacyToLatest';
import { Journey } from '../entities/Journey';

@handler({
  service: 'acquisition',
  method: 'createLegacy',
})
export class CreateJourneyLegacyAction extends AbstractAction {
  public readonly middlewares: (string | [string, any])[] = [
    ['can', ['journey.create']],
    ['validate', 'journey.createLegacy'],
  ];

  constructor(private kernel: KernelInterfaceResolver) {
    super();
  }

  protected async handle(
    params: CreateJourneyParamsInterface | CreateJourneyParamsInterface[],
    context: ContextType,
  ): Promise<Journey | Journey[]> {
    // extract the SIRET to set a default sponsor in the incentives
    const operatorSiret = await this.getOperatorSiret(context.call.user.operator);

    // convert journeys
    const journeys: Journey[] = (Array.isArray(params) ? [...params] : [params]).map(mapLegacyToLatest(operatorSiret));

    // send the converted journeys to new acquisition pipeline
    return this.kernel.call('acquisition:create', journeys, context);
  }

  /**
   * Extract the operator's SIRET number by operator ID
   * Calls the operator service
   */
  protected async getOperatorSiret(operatorId: string): Promise<string | null> {
    const operator = await this.kernel.call(
      'operator:find',
      { _id: operatorId },
      { channel: { service: 'acquisition' }, call: { user: { permissions: ['operator.read'] } } },
    );

    return 'company' in operator ? operator.company.siret : null;
  }
}
