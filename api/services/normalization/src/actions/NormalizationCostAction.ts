import * as _ from 'lodash';

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
  // TODO : middleware

  constructor(private wf: WorkflowProvider) {
    super();
  }

  public async handle(journey: JourneyInterface, context: ContextType): Promise<JourneyInterface> {
    let normalizedJourney = { ...journey };
    // TODO: implementation
    // need to add duration and distance enrichment

    await this.wf.next('normalization:cost', normalizedJourney);

    return normalizedJourney;
  }
}
