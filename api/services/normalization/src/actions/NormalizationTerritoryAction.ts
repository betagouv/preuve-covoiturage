import { Action as AbstractAction } from '@ilos/core';
import { handler, InvalidParamsException } from '@ilos/common';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/normalization/territory.contract';
import { PositionInterface } from '../shared/common/interfaces/PositionInterface';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { TerritoryProviderInterfaceResolver } from '../interfaces/TerritoryProviderInterface';

@handler(handlerConfig)
export class NormalizationTerritoryAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [['channel.service.only', ['acquisition', handlerConfig.service]]];

  constructor(protected territory: TerritoryProviderInterfaceResolver) {
    super();
  }

  public async handle(payload: ParamsInterface): Promise<ResultInterface> {
    return {
      start: await this.fillTerritories(payload.start),
      end: await this.fillTerritories(payload.end),
    };
  }

  private async fillTerritories(position: PositionInterface): Promise<number> {
    // const position: PositionInterface = get(journey, dataPath);
    let result = 0;

    if ('insee' in position) {
      result = await this.territory.findByInsee(position.insee);
    } else if ('lat' in position && 'lon' in position) {
      result = await this.territory.findByPoint({ lon: position.lon, lat: position.lat });
    } else {
      throw new InvalidParamsException('Missing INSEE code or lat & lon');
    }

    return result;
  }
}
