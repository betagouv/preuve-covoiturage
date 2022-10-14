import { handler, KernelInterfaceResolver } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { copyFromContextMiddleware, hasPermissionMiddleware } from '@pdc/provider-middleware';
import { SerializedPolicyInterface } from './../interfaces/engine/PolicyInterface';

import { Policy } from '../engine/entities/Policy';
import { PolicyRepositoryProviderInterfaceResolver } from '../interfaces';
import {
  ParamsInterface as OperatorParamsInterface,
  ResultInterface as OperatorResultInterface,
  signature as operatorFindSignature,
} from '../shared/operator/find.contract';
import { handlerConfig, ParamsInterface, ResultInterface, SingleResultInterface } from '../shared/policy/list.contract';
import { alias } from '../shared/policy/list.schema';

@handler({
  ...handlerConfig,
  middlewares: [
    hasPermissionMiddleware('common.policy.list'),
    copyFromContextMiddleware('call.user.territory_id', 'territory_id'),
    copyFromContextMiddleware(`call.user.operator_id`, 'operator_id'),
    ['validate', alias],
  ],
})
export class ListAction extends AbstractAction {
  constructor(private kernel: KernelInterfaceResolver, private repository: PolicyRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    const policies: SerializedPolicyInterface[] = await this.repository.findWhere(params);

    const result: ResultInterface = await Promise.all(
      policies.map(async (r) => {
        const policy: SingleResultInterface = { ...r, params: null };
        try {
          const importedPolicy = await Policy.import(r);
          policy.params = importedPolicy.params();
        } catch (e) {
          console.error(`Could not import policy ${r._id}`, e);
        } finally {
          return policy;
        }
      }),
    );

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

    return result.filter((p) => this.withOperator(p, operator)).filter((p) => this.wihtoutDraft(p));
  }

  private wihtoutDraft(p: SingleResultInterface): boolean {
    return p.status !== 'draft';
  }

  private withOperator(p: SingleResultInterface, operator: OperatorResultInterface): boolean {
    return !!p.params?.operators?.includes(operator.siret);
  }
}
