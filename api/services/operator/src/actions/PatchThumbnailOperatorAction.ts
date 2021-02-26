import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { copyFromContextMiddleware, hasPermissionByScopeMiddleware } from '@pdc/provider-middleware/dist';

import { OperatorRepositoryProviderInterfaceResolver } from '../interfaces/OperatorRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared//operator/patchThumbnail.contract';
import { alias } from '../shared/operator/patchThumbnail.schema';

@handler({
  ...handlerConfig,
  middlewares: [
    copyFromContextMiddleware('call.user.operator_id', '_id'),
    ['validate', alias],
    hasPermissionByScopeMiddleware('registry.operator.patchThumbnail', [
      'operator.operator.patchThumbnail',
      'call.user.operator_id',
      '_id',
    ]),
  ],
})
export class PatchThumbnailOperatorAction extends AbstractAction {
  constructor(private operatorRepository: OperatorRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    this.operatorRepository.patchThumbnail(params._id, params.thumbnail);

    return { ...params };
  }
}
