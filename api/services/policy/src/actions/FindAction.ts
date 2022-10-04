import { ForbiddenException, handler, KernelInterfaceResolver, NotFoundException } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from '@pdc/provider-middleware/dist';
import { Policy } from '../engine/entities/Policy';

import { PolicyRepositoryProviderInterfaceResolver } from '../interfaces';
import {
  ParamsInterface as OperatorParamsInterface,
  ResultInterface as OperatorResultInterface,
  signature as operatorFindSignature,
} from '../shared/operator/find.contract';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/policy/find.contract';
import { alias } from '../shared/policy/find.schema';

@handler({
  ...handlerConfig,
  middlewares: [
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({
      territory: 'territory.policy.find',
      registry: 'registry.policy.find',
      operator: 'operator.policy.find',
    }),
    ['validate', alias],
  ],
})
export class FindAction extends AbstractAction {
  constructor(
    private kernel: KernelInterfaceResolver,
    private policyRepository: PolicyRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    const policyData = await this.policyRepository.find(params._id, params.territory_id);

    if (!policyData) {
      throw new NotFoundException(`policy #${params._id} not found`);
    }
    const policy = await Policy.import(policyData);

    const result: ResultInterface = {
      ...policy.export(),
      description: policy.describe(),
      params: policy.params(),
    };

    if (!params.operator_id) {
      return result;
    }

    const operator: OperatorResultInterface = await this.kernel.call<OperatorParamsInterface, OperatorResultInterface>(
      operatorFindSignature,
      { _id: params.operator_id },
      {
        channel: { service: handlerConfig.service },
        call: { user: { permissions: ['registry.operator.find'] } },
      },
    );

    if (!result.params.operators.includes(operator.siret)) {
      throw new ForbiddenException('Invalid permissions');
    }
    return result;
  }
}
