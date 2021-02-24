import { Component, Input } from '@angular/core';

import { CampaignUx } from '~/core/entities/campaign/ux-format/campaign-ux';
import { CommonDataService } from '~/core/services/common-data.service';
import { IncentiveUnitEnum } from '~/core/enums/campaign/incentive-unit.enum';

@Component({
  selector: 'app-campaign-table',
  templateUrl: './campaign-table.component.html',
  styleUrls: ['./campaign-table.component.scss'],
})
export class CampaignTableComponent {
  @Input() campaigns: CampaignUx[];
  @Input() displayedColumns = [
    'status',
    'start',
    'end',
    'name',
    'territory',
    // 'amount_spent',
    'max_amount',
    // 'trips_number',
    // 'max_trips',
  ];

  constructor(private _commonDataService: CommonDataService) {}

  isEuro(unit: IncentiveUnitEnum): boolean {
    return unit === IncentiveUnitEnum.EUR;
  }

  getTerritoryName(id: number): string {
    const foundTerritory = this._commonDataService.territories
      ? this._commonDataService.territories.filter((territory) => territory._id === id)[0]
      : null;
    if (foundTerritory) {
      return foundTerritory.shortname ? foundTerritory.shortname : foundTerritory.name;
    }
    // todo: message to sentry
    return '-';
  }
}
