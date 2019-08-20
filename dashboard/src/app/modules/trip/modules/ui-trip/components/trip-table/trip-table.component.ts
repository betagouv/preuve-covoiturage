import { Component, Input, OnInit } from '@angular/core';

import { Trip } from '~/core/entities/trip/trip';
import { TripStatus } from '~/core/entities/trip/trip-status';

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

  getIconStatus(status: TripStatus) {
    switch (status) {
      case TripStatus.ACTIVE:
        return 'check_circle';
      case TripStatus.PENDING:
        return 'warning';
      case TripStatus.ERROR:
        return 'error';
    }
  }

  getIconClass(status: TripStatus) {
    switch (status) {
      case TripStatus.ACTIVE:
        return 'success';
      case TripStatus.PENDING:
        return 'warning';
      case TripStatus.ERROR:
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
