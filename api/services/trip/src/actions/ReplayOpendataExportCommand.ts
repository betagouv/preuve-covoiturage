import { handler } from '@ilos/common';
import { Action } from '@ilos/core';
import { internalOnlyMiddlewares } from '@pdc/provider-middleware/dist';
import { handlerConfig } from '../shared/trip/list.contract';

@handler({
  service: 'trip',
  method: 'replayOpenData',
  middlewares: [...internalOnlyMiddlewares(handlerConfig.service)],
})
export class ReplayOpendataExportCommand extends Action {
  public async handle(params: {}, context: {}): Promise<void> {}
}
