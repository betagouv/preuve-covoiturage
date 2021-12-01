import { Component, Input, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import { TripStatusEnum } from '~/core/enums/trip/trip-status.enum';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { CommonDataService } from '~/core/services/common-data.service';
import { Campaign } from '~/core/entities/campaign/api-format/campaign';
import { Operator } from '~/core/entities/operator/operator';
import { LightTripInterface } from 'shared/trip/common/interfaces/LightTripInterface';
import { TOOLTIPS } from '~/core/const/tooltips.const';

@Component({
  selector: 'app-trip-table',
  templateUrl: './trip-table.component.html',
  styleUrls: ['./trip-table.component.scss'],
})
export class TripTableComponent extends DestroyObservable implements OnInit {
  @Input() displayedColumns: string[];
  @Input() data: LightTripInterface[] = [];
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
      case TripStatusEnum.OK:
        return 'check_circle';
      case TripStatusEnum.EXPIRED:
        return 'warning';
      case TripStatusEnum.CANCELED:
        return 'error';
      default:
        return '';
    }
  }

  getIconClass(status: TripStatusEnum): string {
    switch (status) {
      case TripStatusEnum.OK:
        return 'success';
      case TripStatusEnum.EXPIRED:
        return 'warning';
      case TripStatusEnum.CANCELED:
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
    if (trip.operator_id === null || !this.operators) return '-';
    const operator = this.operators.find((operatorF) => operatorF._id === trip.operator_id);
    return operator ? operator.name : '-';
  }

  getTotalIncentives(trip: LightTripInterface): number | string {
    return trip.incentives;
  }

  getTripRank(trip: LightTripInterface): string {
    return trip.operator_class;
  }

  getRankTip(trip: LightTripInterface): string {
    return TOOLTIPS.classes[trip.operator_class] || null;
  }
}
