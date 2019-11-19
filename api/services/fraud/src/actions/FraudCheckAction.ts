import { Action } from '@ilos/core';
import { handler, ContextType } from '@ilos/common';

import { CheckEngine } from '../engine/CheckEngine';

/*
 * Start a check on an acquisition_id
 */
@handler({
  service: 'fraud',
  method: 'check',
})
export class FraudCheckAction extends Action {
  public readonly middlewares: (string | [string, any])[] = [['channel.service.except', ['proxy']]];

  constructor(private engine: CheckEngine) {
    super();
  }

  public async handle(request: any, context: ContextType): Promise<void> {
    await this.engine.apply(request.acquisition_id, request.method);
    return;
  }
}
