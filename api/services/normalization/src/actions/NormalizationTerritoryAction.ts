import { get, set } from 'lodash';
import { Action as AbstractAction } from '@ilos/core';
import { handler, InvalidParamsException, KernelInterfaceResolver } from '@ilos/common';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/normalization/territory.contract';
import { PositionInterface } from '../shared/common/interfaces/PositionInterface';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { WorkflowProvider } from '../providers/WorkflowProvider';
import { TerritoryProvider } from '../providers/TerritoryProvider';

@handler(handlerConfig)
export class NormalizationTerritoryAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [['channel.transport', ['queue']]];

  constructor(
    protected kernel: KernelInterfaceResolver,
    protected territory: TerritoryProvider,
    protected wf: WorkflowProvider,
  ) {
    super();
  }

  public async handle(journey: ParamsInterface): Promise<ResultInterface> {
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
    const position: PositionInterface = get(journey, `payload.${dataPath}`);
    if ('insee' in position) {
      set(journey, `${dataPath}.territory`, await this.territory.findByInsee(position.insee));
    } else if ('lat' in position && 'lon' in position) {
      set(journey, `${dataPath}.territory`, await this.territory.findByPoint({ lon: position.lon, lat: position.lat }));
    } else {
      throw new InvalidParamsException('Missing INSEE code or lat & lon');
    }
  }
}
