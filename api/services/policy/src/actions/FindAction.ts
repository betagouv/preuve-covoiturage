import { handler, NotFoundException } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from '@pdc/provider-middleware/dist';
import { Policy } from '../engine/entities/Policy';

import { PolicyRepositoryProviderInterfaceResolver } from '../interfaces';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/policy/find.contract';
import { alias } from '../shared/policy/find.schema';

@handler({
  ...handlerConfig,
  middlewares: [
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({
      territory: 'territory.policy.find',
      registry: 'registry.policy.find',
    }),
    ['validate', alias],
  ],
})
export class FindAction extends AbstractAction {
  constructor(private policyRepository: PolicyRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    const policyData = await this.policyRepository.find(params._id, params.territory_id);

    if (!policyData) {
      throw new NotFoundException(`policy #${params._id} not found`);
    }
    const policy = await Policy.import(policyData);

    return {
      ...policy.export(),
      description: policy.describe(),
      slices: policy.getSlices(),
    };
  }
}
