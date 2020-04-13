import { Action } from '@ilos/core';
import { handler, ContextType } from '@ilos/common';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/fraudcheck/check.contract';
import { CheckEngine } from '../engine/CheckEngine';

/*
 * Start a check on an acquisition_id
 */
@handler({
  ...handlerConfig,
  middlewares: [['channel.service.except', ['proxy']]],
})
export class CheckAction extends Action {
  constructor(private engine: CheckEngine) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    await this.engine.apply(params.acquisition_id, params.methods);
    /* TODO :
    * - check si moyenne du score > 80, envoyer un updateStatus à Carpool
    * - vérifier le sélecteur dans campagne pour exclure ces trajets
    */

    return;
  }
}
