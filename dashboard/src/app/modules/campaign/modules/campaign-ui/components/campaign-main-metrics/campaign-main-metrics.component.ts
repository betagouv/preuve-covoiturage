import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import * as moment from 'moment';

import { PolicyInterface } from '~/shared/policy/common/interfaces/PolicyInterface';

@Component({
  selector: 'app-campaign-main-metrics',
  templateUrl: './campaign-main-metrics.component.html',
  styleUrls: ['./campaign-main-metrics.component.scss'],
})
export class CampaignMainMetricsComponent implements OnInit, OnChanges {
  @Input() campaign: PolicyInterface;
  daysRemaining = 0;
  daysPassed = 0;

  budgetSpent = 0;
  budgetTotal = 0;
  budgetRemaining = 0;

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

  constructor() {}

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
    const today = moment();
    const start = moment(this.campaign.start_date);

    // configuration in the database is exclusive end_date
    // to avoid displaying the day after the end of the campaign
    // to the user, we display the day before.
    const end = moment(this.campaign.end_date).subtract(1, 'second');

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

    this.budgetTotal = this.campaign.params?.limits ? this.campaign.params.limits?.glob / 100 : 0;
    this.budgetSpent = this.campaign.incentive_sum / 100;
    this.budgetRemaining = this.campaign ? this.budgetTotal - this.budgetSpent : 1;
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
