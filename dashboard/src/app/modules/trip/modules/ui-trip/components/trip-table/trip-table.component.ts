import { Component, Input, OnInit } from '@angular/core';

import { Trip } from '~/core/entities/trip/trip';
import { TripStatusEnum } from '~/core/enums/trip/trip-status.enum';

@Component({
  selector: 'app-trip-table',
  templateUrl: './trip-table.component.html',
  styleUrls: ['./trip-table.component.scss'],
})
export class TripTableComponent implements OnInit {
  displayedColumns: string[] = [
    'startCity',
    'endCity',
    'date',
    'campaigns',
    'incentives',
    'operator',
    'class',
    'status',
  ];
  @Input() data: Trip[];

  constructor() {}

  ngOnInit() {}

  getIconStatus(status: TripStatusEnum) {
    switch (status) {
      case TripStatusEnum.ACTIVE:
        return 'check_circle';
      case TripStatusEnum.PENDING:
        return 'warning';
      case TripStatusEnum.ERROR:
        return 'error';
    }
  }

  getIconClass(status: TripStatusEnum) {
    switch (status) {
      case TripStatusEnum.ACTIVE:
        return 'success';
      case TripStatusEnum.PENDING:
        return 'warning';
      case TripStatusEnum.ERROR:
        return 'error';
    }
  }

  getCampaignsName(campaigns: any[]): string {
    let names = '';
    campaigns.forEach((campaign, idx) => {
      if (idx !== 0) {
        if (idx !== 1) {
          names += ', ';
        }
        names += campaign.name;
      }
    });
    return names;
  }
}
