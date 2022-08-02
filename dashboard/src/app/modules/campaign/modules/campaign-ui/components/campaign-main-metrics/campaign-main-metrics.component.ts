import { CampaignApiService } from '~/modules/campaign/services/campaign-api.service';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import * as moment from 'moment';
import { ChartData, ChartOptions } from 'chart.js';

import { CampaignUx } from '~/core/entities/campaign/ux-format/campaign-ux';
import { IncentiveUnitEnum } from '~/core/enums/campaign/incentive-unit.enum';

@Component({
  selector: 'app-campaign-main-metrics',
  templateUrl: './campaign-main-metrics.component.html',
  styleUrls: ['./campaign-main-metrics.component.scss'],
})
export class CampaignMainMetricsComponent implements OnInit, OnChanges {
  @Input() campaign: CampaignUx;
  daysRemaining = 1;
  daysPassed = 0;

  budgetTotal = 1;
  budgetRemaining = 1;
  budgetSpent = 0;

  options: ChartOptions = {
    legend: {
      display: false,
    },
    tooltips: {
      enabled: false,
    },
    layout: {
      padding: {
        left: 5,
        right: 5,
        top: 5,
        bottom: 5,
      },
    },
    cutoutPercentage: 75,
    hover: {},
  };

  constructor(private campaignApiService: CampaignApiService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.campaign) {
      this.initPeriod();
      this.initBudget();
    }
  }

  ngOnInit(): void {
    this.initPeriod();
  }

  private initPeriod(): void {
    const start = moment(this.campaign.start);
    const end = moment(this.campaign.end);
    const today = moment();

    const period = end.diff(start, 'days');

    if (today.isBefore(start)) {
      // not started yet
      this.daysRemaining = period;
      this.daysPassed = 0;
    } else if (today.isAfter(end)) {
      // already finished
      this.daysPassed = period;
      this.daysRemaining = 0;
    } else {
      this.daysPassed = today.diff(start, 'days');
      this.daysRemaining = period - this.daysPassed;
    }
  }

  private initBudget(): void {
    if (!this.campaign) {
      return;
    }

    this.campaignApiService.stat(this.campaign._id).subscribe((campaignState) => {
      this.budgetTotal = this.campaign ? this.campaign.max_amount : 0;

      if (!campaignState) {
        return;
      }

      this.budgetSpent =
        this.campaign.unit === IncentiveUnitEnum.EUR ? campaignState.amount / 100 : campaignState.amount;

      this.budgetRemaining = this.campaign ? this.budgetTotal - this.budgetSpent : 1;
    });
  }

  get periodChartData(): ChartData {
    return {
      labels: ['Jours passés', 'Jours restants'],
      datasets: [
        {
          data: [this.daysPassed, this.daysRemaining],
          backgroundColor: ['#65c8cf', 'lightgrey'],
          hoverBackgroundColor: ['#65c8cf', 'lightgrey'],
          borderColor: ['#65c8cf', 'lightgrey'],
          hoverBorderColor: ['#65c8cf', 'lightgrey'],
          // borderWidth: 3,
        },
      ],
    };
  }

  get budgetChartData(): ChartData {
    return {
      labels: ['Budget consommé', 'Budget restant'],
      datasets: [
        {
          data: [this.budgetSpent, this.budgetRemaining],
          backgroundColor: ['#65c8cf', 'lightgrey'],
          hoverBackgroundColor: ['#65c8cf', 'lightgrey'],
          borderColor: ['#65c8cf', 'lightgrey'],
          hoverBorderColor: ['#65c8cf', 'lightgrey'],
          // borderWidth: 3,
        },
      ],
    };
  }
}
