import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType } from '@ilos/common';
import { JourneyInterface } from '@pdc/provider-schema';

import { WorkflowProvider } from '../providers/WorkflowProvider';

// Enrich position data
@handler({
  service: 'normalization',
  method: 'cost',
})
export class NormalizationCostAction extends AbstractAction {
  public readonly middlewares: (string | [string, any])[] = [['channel.transport', ['queue']]];

  constructor(private wf: WorkflowProvider) {
    super();
  }

  public async handle(journey: JourneyInterface, context: ContextType): Promise<JourneyInterface> {
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
