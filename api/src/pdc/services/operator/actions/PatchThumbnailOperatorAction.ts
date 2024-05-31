import { handler } from '@ilos/common/index.ts';
import { Action as AbstractAction } from '@ilos/core/index.ts';
import { copyFromContextMiddleware, hasPermissionByScopeMiddleware } from '@pdc/providers/middleware/index.ts';

import { OperatorRepositoryProviderInterfaceResolver } from '../interfaces/OperatorRepositoryProviderInterface.ts';
import { handlerConfig, ParamsInterface, ResultInterface } from '@shared/operator/patchThumbnail.contract.ts';
import { alias } from '@shared/operator/patchThumbnail.schema.ts';

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
