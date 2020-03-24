import { Component, Input, OnInit, SimpleChanges } from '@angular/core';

import { CampaignUx } from '~/core/entities/campaign/ux-format/campaign-ux';
import { CommonDataService } from '~/core/services/common-data.service';
import { CampaignStatusEnum } from '~/core/enums/campaign/campaign-status.enum';
import { IncentiveUnitEnum } from '~/core/enums/campaign/incentive-unit.enum';

@Component({
  selector: 'app-campaign-table',
  templateUrl: './campaign-table.component.html',
  styleUrls: ['./campaign-table.component.scss'],
})
export class CampaignTableComponent implements OnInit {
  @Input() status: CampaignStatusEnum;
  @Input() campaigns: CampaignUx[];
  @Input() displayedColumns = [
    'name',
    'territory',
    'amount_spent',
    'max_amount',
    'trips_number',
    'max_trips',
    'start',
    'end',
  ];

  constructor(private _commonDataService: CommonDataService) {}

  ngOnInit(): void {}

  canShowDetails(status: CampaignStatusEnum): boolean {
    return (
      status === CampaignStatusEnum.VALIDATED ||
      status === CampaignStatusEnum.PENDING ||
      status === CampaignStatusEnum.ARCHIVED
    );
  }

  isEuro(unit: IncentiveUnitEnum): boolean {
    return unit === IncentiveUnitEnum.EUR;
  }

  getTerritoryName(id: number): string {
    const foundTerritory = this._commonDataService.territories.filter((territory) => territory._id === id)[0];
    if (foundTerritory) {
      return foundTerritory.shortname ? foundTerritory.shortname : foundTerritory.name;
    }
    // todo: message to sentry
    return 'Territoire non défini';
  }

  private ngOnChanges(changes: SimpleChanges): void {
    if (this.status === CampaignStatusEnum.ARCHIVED || this.status === CampaignStatusEnum.VALIDATED) {
      this.displayedColumns = [
        'name',
        'territory',
        'amount_spent',
        'max_amount',
        'trips_number',
        'max_trips',
        'start',
        'end',
      ];
    } else if (this.status === CampaignStatusEnum.DRAFT || this.status === CampaignStatusEnum.PENDING) {
      this.displayedColumns = ['name', 'territory', 'max_amount', 'max_trips', 'start', 'end'];
    } else {
      this.displayedColumns = [
        'name',
        'territory',
        'amount_spent',
        'max_amount',
        'trips_number',
        'max_trips',
        'start',
        'end',
      ];
    }
  }
}
