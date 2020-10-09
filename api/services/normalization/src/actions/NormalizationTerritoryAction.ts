import { Action as AbstractAction } from '@ilos/core';
import { handler, InvalidParamsException, NotFoundException } from '@ilos/common';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/normalization/territory.contract';
import { PositionInterface } from '../shared/common/interfaces/PositionInterface';
import { TerritoryProviderInterfaceResolver } from '../interfaces/TerritoryProviderInterface';

@handler({ ...handlerConfig, middlewares: [['channel.service.only', ['acquisition', handlerConfig.service]]] })
export class NormalizationTerritoryAction extends AbstractAction {
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
    if (!('insee' in position) && (!('lat' in position) || !('lon' in position))) {
      throw new InvalidParamsException('Missing INSEE code or lat & lon');
    }

    let result = null;
    if ('insee' in position) {
      result = await this.territory.findByInsee(position.insee);
      if (result !== null) {
        return result;
      }
    }

    if ('lat' in position && 'lon' in position) {
      result = await this.territory.findByPoint({ lon: position.lon, lat: position.lat });
      if (result !== null) {
        return result;
      }
    }

    throw new NotFoundException('Normalization : territory not found');
  }
}
