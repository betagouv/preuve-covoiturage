// tslint:disable: no-bitwise
import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import { ApiResponse } from '~/entities/responses/apiResponse';
import { STAT_MAIN } from '~/modules/statistics/config/stat_main';
import { MAIN } from '~/config/main';

import { StatisticsService } from '../../services/statisticsService';

@Component({
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class StatisticsPageComponent implements OnInit {
  public loaded = false;
  public data: any = {};
  public toggle = {};
  public graphLineOptions = {
    scales: {
      xAxes: [
        {
          type: 'time',
          time: {
            unit: 'month',
            locale: 'fr',
          },
        },
      ],
    },
    legend: {
      display: false,
    },
  };

  statList = STAT_MAIN.main;
  gitbookLinkStats = MAIN.gitbookLinkStats;

  constructor(private statisticsService: StatisticsService) {}

  private load() {
    this.statisticsService.get().subscribe((response: ApiResponse) => {
      this.loaded = true;
      const { data } = response;
      this.data = {
        summary: {
          journeys: data.collected.total,
          distance: (parseInt(data.distance.total[0].total, 10) / 1000) | 0,
          aom: 3,
          petrol: (parseInt(data.distance.total[0].total, 10) * 0.0000636) | 0,
          co2: (parseInt(data.distance.total[0].total, 10) * 0.000195) | 0,
        },
        graphs: {
          journeysPerDay: {
            labels: data.collected.day.map(this.mapDateLabels),
            datasets: [
              {
                label: 'Trajets par jour',
                data: data.collected.day.map((i) => i.total),
                backgroundColor: '#42A5F588',
                borderColor: '#1E88E5',
              },
            ],
          },
          journeysPerDayTotal: {
            labels: data.collected.day.map(this.mapDateLabels),
            datasets: [
              {
                label: 'Trajets cumulés',
                data: data.collected.day.reduce(this.reduceCumulativeData, []),
                backgroundColor: '#42A5F588',
                borderColor: '#1E88E5',
              },
            ],
          },
          distancePerDay: {
            labels: data.distance.day.map(this.mapDateLabels),
            datasets: [
              {
                label: 'Distance par jour',
                data: data.distance.day.map((i) => i.total / 1000 | 0),
                backgroundColor: '#42A5F588',
                borderColor: '#1E88E5',
              },
            ],
          },
          distancePerDayTotal: {
            labels: data.distance.day.map(this.mapDateLabels),
            datasets: [
              {
                label: 'Distance cumulée',
                data: data.distance.day.reduce(this.reduceCumulativeData, []).map(i => {
                  i.y = i.y / 1000 | 0;
                  return i;
                }),
                backgroundColor: '#42A5F588',
                borderColor: '#1E88E5',
              },
            ],
          },
        },
      };
    });
  }

  private mapDateLabels({ _id }) {
    return new Date(_id.year, _id.month, _id.day);
  }

  private reduceCumulativeData(p, c, i) {
    p[i] = p[i] || {};
    p[i].t = new Date(c._id.year, c._id.month, c._id.day, 0, 0, 0);
    p[i].y = i > 1 ? p[i - 1].y + c.total : c.total;
    return p;
  }

  public handleChange(event, key) {
    this.toggle[key] = event.checked;
  }

  ngOnInit(): void {
    this.load();
  }
}
