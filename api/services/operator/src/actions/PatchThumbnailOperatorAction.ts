import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';

import { OperatorRepositoryProviderInterfaceResolver } from '../interfaces/OperatorRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared//operator/patchThumbnail.contract';
import { alias } from '../shared/operator/patchThumbnail.schema';

@handler({
  ...handlerConfig,
  middlewares: [
    ['can', ['operator.contacts.update']],
    ['context_extract', { _id: 'call.user.operator_id' }],
    ['validate', alias],
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
