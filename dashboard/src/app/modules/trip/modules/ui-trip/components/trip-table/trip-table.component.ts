import { Component, Input, OnInit } from '@angular/core';
import * as _ from 'lodash';

import { Trip } from '~/core/entities/trip/trip';
import { TripStatusEnum } from '~/core/enums/trip/trip-status.enum';
import { Person } from '~/core/entities/trip/person';
import { IncentiveUnitEnum } from '~/core/enums/campaign/incentive-unit.enum';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { OperatorService } from '~/modules/operator/services/operator.service';

@Component({
  selector: 'app-trip-table',
  templateUrl: './trip-table.component.html',
  styleUrls: ['./trip-table.component.scss'],
})
export class TripTableComponent extends DestroyObservable implements OnInit {
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

  constructor(private operatorService: OperatorService) {
    super();
  }

  ngOnInit() {}

  getIconStatus(status: TripStatusEnum) {
    switch (status) {
      case TripStatusEnum.ACTIVE:
        return 'check_circle';
      case TripStatusEnum.PENDING:
        return 'warning';
      case TripStatusEnum.ERROR:
        return 'error';
      // TODO DELETE, just for demo
      default:
        return 'check_circle';
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
      // TODO DELETE, just for demo
      default:
        return 'success';
    }
  }

  getCampaignsName(campaigns: any[]): string {
    if (!campaigns) {
      return '';
    }
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
    return start ? driver.start_town : driver.end_town;
  }

  getOperator(trip: Trip): string {
    const driver: Person = trip.people ? trip.people.find((p) => p.is_driver) : null;
    if (!driver || !driver.operator_id) {
      return '';
    }
    // TODO delete replace function after back fix
    return this.operatorService.getOperatorName(driver.operator_id.replace(/\"/g, ''));
  }

  getTotalIncentives(trip: Trip): string {
    if (!trip.people) {
      return '-';
    }
    const incentives: any[] = _.flattenDeep(trip.people.map((p) => p.incentives));
    const amount = incentives.reduce((a, b) => a + (b.amount || 0), 0);
    return amount ? amount : '-';
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
    if (isPoint) {
      return 'points';
    }
    return '';
  }

  getIncetivesTooltip(trip: Trip): string {
    let tooltip = '';
    const driver: Person = trip.people ? trip.people.find((p) => p.is_driver) : null;
    const passengers: Person[] = trip.people ? trip.people.filter((p) => !p.is_driver) : null;

    if (driver) {
      const incentives = driver.incentives.map((i) => `${i.amount} ${i.amount_unit}`);
      tooltip += incentives && incentives.length > 0 ? `Conducteur: ${incentives.join(' ,')}` : '';
    }
    passengers.forEach((p, idx) => {
      const incentives = p.incentives.map((i) => `${i.amount} ${i.amount_unit}`);
      tooltip += incentives && incentives.length > 0 ? `\nPassager n°${idx + 1}: ${incentives.join(' ,')}` : '';
    });

    return tooltip;
  }

  getTripRank(trip: Trip): string {
    const driver: Person = trip.people ? trip.people.find((p) => p.is_driver) : null;
    if (!driver) {
      return '';
    }
    return driver.rank;
  }
}
