import { Action } from '@ilos/core';
import { handler, ContextType, KernelInterfaceResolver } from '@ilos/common';

import { CheckEngine } from '../engine/CheckEngine';

/*
 * Start all available checks on an acquisition_id
 */
@handler({
  service: 'fraud',
  method: 'checkAll',
})
export class FraudCheckAllAction extends Action {
  public readonly middlewares: (string | [string, any])[] = [['channel.transport', ['queue']]];

  constructor(
    private engine: CheckEngine,
    private kernel: KernelInterfaceResolver,
  ) {
    super();
  }

  public async handle(request: any, context: ContextType): Promise<void> {
    const { acquisition_id } = request;
    const processableChecks = await this.engine.listUnprocessedMethods(acquisition_id);
    for (const method of processableChecks) {
      await this.kernel.notify(
        'fraud:check',
        {
          method,
          acquisition_id,
        },
        {
          call: {
            user: {}
          },
          channel: {
            service: 'fraud',
          }
        }
      );
    }
    return;
  }
}
