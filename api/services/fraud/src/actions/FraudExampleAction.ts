import { Action } from '@ilos/core';
import { handler, ContextType } from '@ilos/common';

import { FraudCheckRepositoryProviderInterfaceResolver } from '../interfaces/FraudCheckRepositoryProviderInterface';

/*
 * Example fraud check action
 */
@handler({
  service: 'fraud',
  method: 'example',
})
export class FraudExampleAction extends Action {
  public readonly middlewares: (string | [string, any])[] = [['channel.transport', ['queue']]];

  constructor(private fraudRepository: FraudCheckRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(request: any, context: ContextType): Promise<void> {
    // do awesome checks
    return;
  }
}
