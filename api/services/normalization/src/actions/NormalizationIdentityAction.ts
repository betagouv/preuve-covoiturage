import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/normalization/identity.contract';

// Enrich position data
@handler({ ...handlerConfig, middlewares: [['channel.service.only', ['acquisition', handlerConfig.service]]] })
export class NormalizationIdentityAction extends AbstractAction {
  constructor() {
    super();
  }

  public async handle(identity: ParamsInterface): Promise<ResultInterface> {
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
