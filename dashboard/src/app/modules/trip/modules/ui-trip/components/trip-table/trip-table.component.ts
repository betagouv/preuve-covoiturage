import { Component, Input, OnInit } from '@angular/core';

import { Trip } from '~/core/entities/trip/trip';
import { TripStatusEnum } from '~/core/enums/trip/trip-status.enum';
import { Person } from '~/core/entities/trip/person';
import { IncentiveUnitEnum } from '~/core/enums/campaign/incentive-unit.enum';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { OperatorService } from '~/modules/operator/services/operator.service';
import { CommonDataService } from '~/core/services/common-data.service';
import { Campaign } from '~/core/entities/campaign/campaign';
import { Operator } from '~/core/entities/operator/operator';

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
  private operators: Operator[];
  private campaigns: Campaign[];

  constructor(private operatorService: OperatorService, private commonData: CommonDataService) {
    super();
  }

  ngOnInit() {
    this.commonData.operators$.subscribe((operators) => (this.operators = operators));
    this.commonData.campaigns$.subscribe((campaigns) => (this.campaigns = campaigns));
  }

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
      const campaignFound = this.campaigns.find((cp) => cp._id === campaign);
      names += campaignFound ? campaignFound.name : campaign;
    });
    return names;
  }

  getCity(trip: any, start: boolean): string {
    const driver: Person = trip.people ? trip.people.find((p) => p.is_driver) : null;
    if (!driver) {
      return '';
    }
    return start ? trip.start_town : trip.end_town;
  }

  getOperator(trip: any): string {
    const operator = this.operators.find((operatorF) => operatorF._id === trip.operator_id);
    return operator.nom_commercial;
  }

  getTotalIncentives(trip: any): string {
    if (!trip.people) {
      return '-';
    }
    const incentives: any[] = trip.incentives;
    const amount = incentives.reduce((a, b) => a + (b.amount || 0), 0);
    return amount ? amount : '-';
  }

  getTotalIncentivesUnit(trip: Trip): string {
    if (!trip.people) {
      return '';
    }
    const incentives: any[] = trip.incentives;
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

  getIncentivesTooltip(trip: any): string {
    let tooltip = '';
    const incentives = trip.incentives;
    tooltip += incentives && incentives.length > 0 ? `Conducteur: ${incentives.join(' ,')}` : '';

    // passengers.forEach((p, idx) => {
    //   const incentives = p.incentives.map((i) => `${i.amount} ${i.amount_unit}`);
    //   tooltip += incentives && incentives.length > 0 ? `\nPassager n°${idx + 1}: ${incentives.join(' ,')}` : '';
    // });

    return tooltip;
  }

  getTripRank(trip: any): string {
    return trip.operator_class;
  }
}
