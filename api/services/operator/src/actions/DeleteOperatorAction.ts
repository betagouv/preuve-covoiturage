import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';

import { OperatorRepositoryProviderInterfaceResolver } from '../interfaces/OperatorRepositoryProviderInterface';

@handler({
  service: 'operator',
  method: 'delete',
})
export class DeleteOperatorAction extends AbstractAction {
  public readonly middlewares: (string | [string, any])[] = [
    ['can', ['operator.delete']],
    ['validate', 'operator.delete'],
  ];

  constructor(private operatorRepository: OperatorRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: { _id: string }): Promise<boolean> {
    await this.operatorRepository.delete(params._id);
    return true;
  }
}
