import { Component, Input, OnInit } from '@angular/core';
import * as _ from 'lodash';

import { Trip } from '~/core/entities/trip/trip';
import { TripStatusEnum } from '~/core/enums/trip/trip-status.enum';
import { Person } from '~/core/entities/trip/person';
import { IncentiveUnit } from '~/core/entities/campaign/IncentiveUnit';

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

  getCity(trip: Trip, start: boolean): string {
    const driver: Person = trip.people ? trip.people.find((p) => p.is_driver) : null;
    if (!driver) {
      return '';
    }
    return start ? driver.start : driver.end;
  }

  getOperator(trip: Trip): string {
    const driver: Person = trip.people ? trip.people.find((p) => p.is_driver) : null;
    if (!driver || !driver.operator) {
      return '';
    }
    return driver.operator.nom_commercial;
  }

  getTotalIncentives(trip: Trip): number {
    if (!trip.people) {
      return 0;
    }
    let incentives: any[] = _.flattenDeep(trip.people.map((p) => p.incentives));
    return incentives.reduce((a, b) => a + (b.amount || 0), 0);
  }

  getTotalIncentivesUnit(trip: Trip): string {
    if (!trip.people) {
      return '';
    }
    let incentives: any[] = _.flattenDeep(trip.people.map((p) => p.incentives));
    const is_eur = !!incentives.find((i) => i.amount_unit === IncentiveUnit.EUR);
    const is_point = !!incentives.find((i) => i.amount_unit === IncentiveUnit.POINT);
    // TODO Utiliser IncentiveUnitFr quand il sera mergé
    if (is_eur && is_point) {
      return '€ / points';
    } else if (is_eur) {
      return '€';
    } else {
      return 'points';
    }
  }

  getIncetivesTooltip(trip: Trip): string {
    let tooltip = '';
    const driver: Person = trip.people ? trip.people.find((p) => p.is_driver) : null;
    const passengers: Person[] = trip.people ? trip.people.filter((p) => !p.is_driver) : null;

    if (driver) {
      const incentives = driver.incentives.map((i) => `${i.amount} ${i.amount_unit}`);
      tooltip += `Conducteur: ${incentives.join(' ,')}`;
    }
    passengers.forEach((p, idx) => {
      const incentives = p.incentives.map((i) => `${i.amount} ${i.amount_unit}`);
      tooltip += `\nPassager n°${idx + 1}: ${incentives.join(' ,')}`;
    });

    return tooltip;
  }
}
