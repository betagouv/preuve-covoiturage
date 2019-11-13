import { Component, Input, OnInit } from '@angular/core';
import * as moment from 'moment';
import { ChartData, ChartOptions } from 'chart.js';

import { CampaignUx } from '~/core/entities/campaign/ux-format/campaign-ux';

@Component({
  selector: 'app-campaign-main-metrics',
  templateUrl: './campaign-main-metrics.component.html',
  styleUrls: ['./campaign-main-metrics.component.scss'],
})
export class CampaignMainMetricsComponent implements OnInit {
  @Input() campaign: CampaignUx;
  daysRemaining = 1;
  daysPassed = 0;

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

  constructor() {}

  ngOnInit() {
    this.initPeriod();
    this.initBudget();
  }

  private initPeriod() {
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
      this.daysPassed = 0;
      this.daysRemaining = 0;
    } else {
      this.daysPassed = today.diff(start, 'days');
      this.daysRemaining = period - this.daysPassed;
    }
  }

  private initBudget() {
    if (!this.campaign.amount_spent) {
      this.budgetSpent = 0;
      this.budgetRemaining = this.campaign.max_amount;
      return;
    }
    this.budgetRemaining = this.campaign.max_amount - this.campaign.amount_spent;
    this.budgetSpent = this.campaign.amount_spent;
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
