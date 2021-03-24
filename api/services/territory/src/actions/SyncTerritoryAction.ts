import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/territory/sync.contract';
import { TerritoryAdministrativeDataProvider, Level } from '../providers/TerritoryAdministrativeDataProvider';

@handler({
  ...handlerConfig,
  middlewares: [['can', ['territory.create']]],
})
export class SyncTerritoryAction extends AbstractAction {
  constructor(protected territoryAdminDataProvider: TerritoryAdministrativeDataProvider) {
    super();
  }

  public async handle(): Promise<ResultInterface> {
    // const regions = await this.territoryAdminDataProvider.syncData(
    //   Level.Region,
    //   await this.territoryAdminDataProvider.listRegions()
    // );
    // for (const region of regions) {
    //   const districts = await this.territoryAdminDataProvider.syncData(
    //     Level.District,
    //     await this.territoryAdminDataProvider.listDistrictsByRegionCode(region.code),
    //     region.territory_id,
    //   );
    //   for (const district of districts) {
    //     await this.territoryAdminDataProvider.syncData(
    //       Level.City,
    //       await this.territoryAdminDataProvider.listCitiesByDistrictCode(district.code),
    //       district.territory_id,
    //     );
    //   }
    // }
  }
}
