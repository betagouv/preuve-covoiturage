import { Component, Input, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import { TripStatusEnum } from '~/core/enums/trip/trip-status.enum';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { CommonDataService } from '~/core/services/common-data.service';
import { Campaign } from '~/core/entities/campaign/api-format/campaign';
import { Operator } from '~/core/entities/operator/operator';
import { LightTripInterface } from '~/core/interfaces/trip/tripInterface';

@Component({
  selector: 'app-trip-table',
  templateUrl: './trip-table.component.html',
  styleUrls: ['./trip-table.component.scss'],
})
export class TripTableComponent extends DestroyObservable implements OnInit {
  @Input() displayedColumns: string[];
  @Input() data: LightTripInterface[];
  private operators: Operator[];
  private campaigns: Campaign[];

  constructor(private commonData: CommonDataService) {
    super();
  }

  ngOnInit(): void {
    this.commonData.operators$.pipe(takeUntil(this.destroy$)).subscribe((operators) => (this.operators = operators));
    this.commonData.campaigns$.pipe(takeUntil(this.destroy$)).subscribe((campaigns) => (this.campaigns = campaigns));
  }

  getIconStatus(status: TripStatusEnum): string {
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

  getIconClass(status: TripStatusEnum): string {
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

  getCampaignsName(campaignIds: number[] = []): string {
    if (campaignIds.length === 0) {
      return '';
    }
    let names = '';
    campaignIds.forEach((id, idx) => {
      const campaignFound = this.campaigns.find((cp) => cp._id === id);
      if (campaignFound) {
        if (idx > 0) {
          names += ', ';
        }
        names += campaignFound.name;
      }
    });
    return names;
  }

  getOperator(trip: LightTripInterface): string {
    if (trip.operator_id === null) return 'Non visible';
    if (!this.operators) return '';
    const operator = this.operators.find((operatorF) => operatorF._id === trip.operator_id);
    if (!operator) throw new Error('Operator not found !');
    return operator.name;
  }

  getTotalIncentives(trip: LightTripInterface): number | string {
    // todo: fix this when incentives are ready
    return '-';
  }

  getTotalIncentivesUnit(trip: LightTripInterface): string {
    // todo: fix this when incentives are ready
    // const isEur = !!incentives.find((i) => i.amount_unit === IncentiveUnitEnum.EUR);
    // const isPoint = !!incentives.find((i) => i.amount_unit === IncentiveUnitEnum.POINT);
    // if (isEur && isPoint) {
    //   return `${INCENTIVE_UNITS_FR.euro} / ${INCENTIVE_UNITS_FR.point}`;
    // }
    // if (isEur) {
    //   return `${INCENTIVE_UNITS_FR.euro}`;
    // }
    // if (isPoint) {
    //   return `${INCENTIVE_UNITS_FR.point}`;
    // }
    return '';
  }

  // getIncentivesTooltip(trip: LightTripInterface): string {
  //   let tooltip = '';
  //   const dIncentives = trip.incentives.driver;
  //   if (dIncentives && dIncentives.length > 0) {
  //     // todo: separate by amount unit
  //     tooltip += `Conducteur: ${dIncentives.map((inc) => inc.amount).join(' ,')}`;
  //   }
  //   const pIncentives = trip.incentives.passenger;
  //   if (pIncentives && pIncentives.length > 0) {
  //     if (dIncentives && dIncentives.length > 0) {
  //       tooltip += ', ';
  //     }
  //     // todo: separate by amount unit
  //     tooltip += `Passager: ${pIncentives.map((inc) => inc.amount).join(' ,')}`;
  //   }
  //   return tooltip;
  // }

  getTripRank(trip: LightTripInterface): string {
    return trip.operator_class;
  }
}
