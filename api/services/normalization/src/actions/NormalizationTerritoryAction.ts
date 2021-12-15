import { Action as AbstractAction } from '@ilos/core';
import { handler, InvalidParamsException, NotFoundException } from '@ilos/common';
import { internalOnlyMiddlewares } from '@pdc/provider-middleware';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/normalization/territory.contract';
import { PositionInterface } from '../shared/common/interfaces/PositionInterface';
import { TerritoryProviderInterfaceResolver } from '../interfaces/TerritoryProviderInterface';

@handler({ ...handlerConfig, middlewares: [...internalOnlyMiddlewares(handlerConfig.service)] })
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
    if (!('geo_code' in position) && (!('lat' in position) || !('lon' in position))) {
      throw new InvalidParamsException('Missing INSEE code or lat & lon');
    }

    let result = null;
    if ('lat' in position && 'lon' in position) {
      result = await this.territory.findByPoint({ lon: position.lon, lat: position.lat });
      if (result !== null) {
        return result;
      }
    }

    if ('geo_code' in position) {
      result = await this.territory.findByInsee(position.geo_code);
      if (result !== null) {
        return result;
      }
    }

    throw new NotFoundException('Normalization : territory not found');
  }
}
