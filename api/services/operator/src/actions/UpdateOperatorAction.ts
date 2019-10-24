import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { UpdateOperatorParamsInterface, OperatorInterface } from '@pdc/provider-schema';

import { OperatorRepositoryProviderInterfaceResolver } from '../interfaces/OperatorRepositoryProviderInterface';

@handler({
  service: 'operator',
  method: 'update',
})
export class UpdateOperatorAction extends AbstractAction {
  public readonly middlewares: (string | [string, any])[] = [
    ['can', ['operator.update']],
    ['validate', 'operator.update'],
  ];

  constructor(private operatorRepository: OperatorRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: UpdateOperatorParamsInterface): Promise<OperatorInterface> {
    return this.operatorRepository.update(params);
  }
}
