import { Component, Input, OnInit } from '@angular/core';
import * as _ from 'lodash';

import { Trip } from '~/core/entities/trip/trip';
import { TripStatusEnum } from '~/core/enums/trip/trip-status.enum';
import { Person } from '~/core/entities/trip/person';
import { IncentiveUnitEnum } from '~/core/enums/campaign/incentive-unit.enum';

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
    const incentives: any[] = _.flattenDeep(trip.people.map((p) => p.incentives));
    return incentives.reduce((a, b) => a + (b.amount || 0), 0);
  }

  getTotalIncentivesUnit(trip: Trip): string {
    if (!trip.people) {
      return '';
    }
    const incentives: any[] = _.flattenDeep(trip.people.map((p) => p.incentives));
    const isEur = !!incentives.find((i) => i.amount_unit === IncentiveUnitEnum.EUR);
    const isPoint = !!incentives.find((i) => i.amount_unit === IncentiveUnitEnum.POINT);
    // TODO Utiliser IncentiveUnitFr quand il sera mergé
    if (isEur && isPoint) {
      return '€ / points';
    }
    if (isEur) {
      return '€';
    }
    return 'points';
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
