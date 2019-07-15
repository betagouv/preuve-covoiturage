import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';

import { OperatorRepositoryProviderInterfaceResolver } from '../interfaces/OperatorRepositoryProviderInterface';

@handler({
  service: 'operator',
  method: 'all',
})
export class AllOperatorAction extends AbstractAction {
  public readonly middlewares: (string | [string, any])[] = [['can', ['operator.list']]];

  constructor(private operatorRepository: OperatorRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(): Promise<any[]> {
    return this.operatorRepository.all();
  }
}
