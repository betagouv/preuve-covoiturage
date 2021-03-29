import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';
import { GeoImporter } from '@pdc/provider-geoimport';

import { handlerConfig, ResultInterface } from '../shared/territory/sync.contract';
import { TerritoryAdministrativeDataProvider, Level } from '../providers/TerritoryAdministrativeDataProvider';

@handler({
  ...handlerConfig,
  middlewares: [['can', ['territory.create']]],
})
export class SyncTerritoryAction extends AbstractAction {
  constructor(
    protected territoryAdminDataProvider: TerritoryAdministrativeDataProvider,
    protected geoImporterProvider: GeoImporter,
  ) {
    super();
  }

  public async handle(): Promise<ResultInterface> {
    // import geo data
    await this.geoImporterProvider.process([
      async (data) => {
        await this.territoryAdminDataProvider.updateOrCreate({ ...data, level: Level.City });
        return data;
      },
    ]);

    const regions = await this.geoImporterProvider.listRegions();
    for (const region of regions) {
      // import region
      await this.territoryAdminDataProvider.updateOrCreate({ ...region, level: Level.Region });
      const regionCode = region.codes.find((c) => c.type === 'insee').value;
      const districts = await this.geoImporterProvider.listDistrictsByRegionCode(regionCode);
      for (const district of districts) {
        // import district
        await this.territoryAdminDataProvider.updateOrCreate({ ...district, level: Level.District });
        const districtCode = district.codes.find((c) => c.type === 'insee').value;
        const cities = await this.geoImporterProvider.listCitiesByDistrictCode(districtCode);
        // import cities
        await this.territoryAdminDataProvider.updateOrCreate(cities.map((c) => ({ ...c, level: Level.City })));
        // link district and cities
        await this.territoryAdminDataProvider.link(
          district.codes,
          cities.map((c) => c.codes),
        );
      }
      // link region and districts
      await this.territoryAdminDataProvider.link(
        region.codes,
        districts.map((c) => c.codes),
      );
    }
  }
}
