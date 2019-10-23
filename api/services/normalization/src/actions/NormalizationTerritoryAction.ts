import * as _ from 'lodash';
import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType, InvalidParamsException, KernelInterfaceResolver } from '@ilos/common';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/normalization/territory.contract';
import { PositionInterface } from '../shared/common/interfaces/PositionInterface';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { WorkflowProvider } from '../providers/WorkflowProvider';

// Find the territories where the driver and passenger started and ended their journey
const callContext: ContextType = {
  call: {
    user: {},
  },
  channel: {
    service: 'normalization',
  },
};

@handler(handlerConfig)
export class NormalizationTerritoryAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [['channel.transport', ['queue']]];

  constructor(protected kernel: KernelInterfaceResolver, protected wf: WorkflowProvider) {
    super();
  }

  public async handle(journey: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    this.logger.debug(`Normalization:territory on ${journey._id}`);
    const normalizedJourney = { ...journey };

    const promises: Promise<void>[] = [];

    for (const dataPath of ['passenger.start', 'passenger.end', 'driver.start', 'driver.end']) {
      promises.push(this.fillTerritories(normalizedJourney, dataPath));
    }
    await Promise.all(promises);

    await this.wf.next('normalization:territory', normalizedJourney);

    return normalizedJourney;
  }

  private async fillTerritories(journey: ParamsInterface, dataPath: string): Promise<void> {
    const position: PositionInterface = _.get(journey, dataPath);
    if ('insee' in position) {
      const data = await this.kernel.call('territory:findByInsee', { insee: position.insee }, callContext);
      _.set(journey, `${dataPath}.territory`, data._id);
    } else if ('lat' in position && 'lon' in position) {
      const data = await this.kernel.call(
        'territory:findByPosition',
        {
          lat: position.lat,
          lon: position.lon,
        },
        callContext,
      );
      _.set(journey, `${dataPath}.territory`, data);
    } else {
      throw new InvalidParamsException('Missing INSEE code or lat & lon');
    }
  }
}
