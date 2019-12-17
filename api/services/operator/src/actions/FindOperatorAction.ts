import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';

import { OperatorRepositoryProviderInterfaceResolver } from '../interfaces/OperatorRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/operator/find.contract';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { alias } from '../shared/operator/find.schema';

@handler(handlerConfig)
export class FindOperatorAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [['can', ['operator.read']], ['validate', alias]];

  constructor(private operatorRepository: OperatorRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    const operator = this.operatorRepository.find(params._id);

    /*

    console.log('operator.siret : ', operator.siret);
    if (operator.siret) {
      operator.company = kernel.call(companyFindSignature, { siret: operator.siret },{channel: });
      console.log('operator.company : ', operator.company);
    }
    */

    //operator.company = kernel.call(companyFindSignature, { siret: operator.siret },{channel: });

    return operator;
  }
}
