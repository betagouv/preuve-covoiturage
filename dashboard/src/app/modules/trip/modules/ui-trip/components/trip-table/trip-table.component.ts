import { Component, Input, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import { Trip } from '~/core/entities/trip/trip';
import { TripStatusEnum } from '~/core/enums/trip/trip-status.enum';
import { INCENTIVE_UNITS_FR, IncentiveUnitEnum } from '~/core/enums/campaign/incentive-unit.enum';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { OperatorService } from '~/modules/operator/services/operator.service';
import { CommonDataService } from '~/core/services/common-data.service';
import { Campaign } from '~/core/entities/campaign/api-format/campaign';
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
    this.commonData.operators$.pipe(takeUntil(this.destroy$)).subscribe((operators) => (this.operators = operators));
    this.commonData.campaigns$.pipe(takeUntil(this.destroy$)).subscribe((campaigns) => (this.campaigns = campaigns));
  }

  getIconStatus(status: TripStatusEnum) {
    switch (status) {
      case TripStatusEnum.LOCKED:
        return 'check_circle';
      case TripStatusEnum.ACTIVE:
        return 'check_circle';
      case TripStatusEnum.PENDING:
        return 'warning';
      case TripStatusEnum.ERROR:
        return 'error';
      default:
        return '';
    }
  }

  getIconClass(status: TripStatusEnum) {
    switch (status) {
      case TripStatusEnum.LOCKED:
        return 'success';
      case TripStatusEnum.ACTIVE:
        return 'success';
      case TripStatusEnum.PENDING:
        return 'warning';
      case TripStatusEnum.ERROR:
        return 'error';
      default:
        return '';
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

  getOperator(trip: Trip): string {
    const operator = this.operators.find((operatorF) => operatorF._id === trip.operator_id);
    if (!operator && trip.operator_id !== null) console.error('Operator not found !');
    return trip.operator_id !== null ? operator.name : 'Non visible';
  }

  getTotalIncentives(trip: Trip): string {
    const incentives: any[] = trip.incentives;
    const amount = incentives.reduce((a, b) => a + (b.amount || 0), 0);
    return amount ? amount : '-';
  }

  getTotalIncentivesUnit(trip: Trip): string {
    const incentives: any[] = trip.incentives;
    const isEur = !!incentives.find((i) => i.amount_unit === IncentiveUnitEnum.EUR);
    const isPoint = !!incentives.find((i) => i.amount_unit === IncentiveUnitEnum.POINT);
    if (isEur && isPoint) {
      return `${INCENTIVE_UNITS_FR.euro} / ${INCENTIVE_UNITS_FR.point}`;
    }
    if (isEur) {
      return `${INCENTIVE_UNITS_FR.euro}`;
    }
    if (isPoint) {
      return `${INCENTIVE_UNITS_FR.point}`;
    }
    return '';
  }

  getIncentivesTooltip(trip: Trip): string {
    let tooltip = '';
    const incentives = trip.incentives;
    tooltip += incentives && incentives.length > 0 ? `Conducteur: ${incentives.join(' ,')}` : '';

    // passengers.forEach((p, idx) => {
    //   const incentives = p.incentives.map((i) => `${i.amount} ${i.amount_unit}`);
    //   tooltip += incentives && incentives.length > 0 ? `\nPassager n°${idx + 1}: ${incentives.join(' ,')}` : '';
    // });

    return tooltip;
  }

  getTripRank(trip: Trip): string {
    return trip.operator_class;
  }
}
