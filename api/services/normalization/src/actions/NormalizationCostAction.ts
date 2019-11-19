import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/normalization/cost.contract';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { WorkflowProvider } from '../providers/WorkflowProvider';

// Enrich position data
@handler(handlerConfig)
export class NormalizationCostAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [['channel.transport', ['queue']]];

  constructor(private wf: WorkflowProvider) {
    super();
  }

  public async handle(journey: ParamsInterface): Promise<ResultInterface> {
    this.logger.debug(`Normalization:cost on ${journey._id}`);

    const normalizedJourney = { ...journey };
    // TODO: implementation cost enrichment
    // if expense, calculate contribution or revenue by adding incentive
    // if contribution, calculate expense by adding incentive
    // if revenue, calculate expense by removing incentive

    // need to add duration and distance enrichment

    await this.wf.next('normalization:cost', normalizedJourney);

    return normalizedJourney;
  }
}
