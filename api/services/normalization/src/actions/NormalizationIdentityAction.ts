import { Action as AbstractAction } from '@ilos/core';
import { handler, KernelInterfaceResolver } from '@ilos/common';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/normalization/identity.contract';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { WorkflowProvider } from '../providers/WorkflowProvider';
import { IdentityInterface } from '../shared/common/interfaces/IdentityInterface';
import { LegacyIdentityInterface } from '../shared/common/interfaces/LegacyIdentityInterface';

// Enrich position data
@handler(handlerConfig)
export class NormalizationIdentityAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [['channel.service.only', ['acquisition', handlerConfig.service]]];

  constructor(private wf: WorkflowProvider, private kernel: KernelInterfaceResolver) {
    super();
  }

  public async handle(journey: ParamsInterface): Promise<ResultInterface> {
    this.logger.debug(`Normalization:identity on ${journey._id}`);

    const normalizedJourney = { ...journey };

    if (journey.payload.passenger) {
      journey.payload.passenger.identity = this.normalizeIdentity(journey.payload.passenger.identity);
    }

    if (journey.payload.driver) {
      journey.payload.driver.identity = this.normalizeIdentity(journey.payload.driver.identity);
    }

    await this.wf.next('normalization:identity', normalizedJourney);

    return normalizedJourney;
  }

  private normalizeIdentity(identity: IdentityInterface | LegacyIdentityInterface): IdentityInterface {
    if ('travel_pass' in identity && typeof identity === 'object') {
      const id = {
        ...identity,
        travel_pass_name: identity.travel_pass.name,
        travel_pass_user_id: identity.travel_pass.user_id,
      };

      delete id.travel_pass;
      return id;
    }

    return identity;
  }
}
