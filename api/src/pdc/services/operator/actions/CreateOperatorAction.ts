import { handler } from '@ilos/common/index.ts';
import { Action as AbstractAction } from '@ilos/core/index.ts';
import { hasPermissionMiddleware } from '@pdc/providers/middleware/index.ts';

import { phoneComplianceHelper } from '../helpers/phoneComplianceHelper.ts';
import { OperatorRepositoryProviderInterfaceResolver } from '../interfaces/OperatorRepositoryProviderInterface.ts';
import { handlerConfig, ParamsInterface, ResultInterface } from '@shared/operator/create.contract.ts';
import { alias } from '@shared/operator/create.schema.ts';

@handler({
  ...handlerConfig,
  middlewares: [hasPermissionMiddleware('registry.operator.create'), ['validate', alias]],
})
export class CreateOperatorAction extends AbstractAction {
  constructor(private operatorRepository: OperatorRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    // check phone numbers
    phoneComplianceHelper(params.contacts);

    return this.operatorRepository.create(params);
  }
}
