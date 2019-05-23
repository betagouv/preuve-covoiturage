// tslint:disable: no-bitwise
import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { get } from 'lodash';

import { MAIN } from '~/config/main';

@Component({
  selector: 'app-stats-content',
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class StatisticsContentComponent implements OnInit {
  public loaded = false;
  public toggle = {
    journeysPerDaySwitch: true,
    distancePerDaySwitch: true,
  };
  public data = {};
  public gitbookLinkStats: string = MAIN.gitbookLinkStats;
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
  public graphBarOptions = {
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

  @Input() set apiData(d) {
    if (!d || !d.journeys || !d.distance || !d.duration) return;

    this.loaded = true;
    this.data = {
      summary: {
        journeys: get(d, 'journeys.total', 0),
        distance: (this.getDistance(d) / 1000) | 0,
        aom: 3,
        petrol: (this.getDistance(d) * 0.0000636) | 0,
        co2: (this.getDistance(d) * 0.000195) | 0,
      },
      graphs: {
        journeysPerMonth: {
          labels: get(d, 'journeys.month', []).map(this.mapDateLabelsPerMonth),
          datasets: [
            {
              label: 'Trajets par mois',
              data: get(d, 'journeys.month', []).map((i) => i.total),
              backgroundColor: '#42A5F588',
              hoverBackgroundColor: '#42A5F5EE',
              borderColor: '#1E88E5',
            },
          ],
        },
        journeysPerDayTotal: {
          labels: get(d, 'journeys.day', []).map(this.mapDateLabelsPerDay),
          datasets: [
            {
              label: 'Trajets cumulés',
              data: get(d, 'journeys.day', []).reduce(this.reduceCumulativeData, []),
              backgroundColor: '#42A5F588',
              borderColor: '#1E88E5',
            },
          ],
        },
        distancePerMonth: {
          labels: get(d, 'distance.month', []).map(this.mapDateLabelsPerMonth),
          datasets: [
            {
              label: 'Distance par jour',
              data: get(d, 'distance.month', []).map((i) => (i.total / 1000) | 0),
              backgroundColor: '#42A5F588',
              hoverBackgroundColor: '#42A5F5EE',
              borderColor: '#1E88E5',
            },
          ],
        },
        distancePerDayTotal: {
          labels: get(d, 'distance.day', []).map(this.mapDateLabelsPerDay),
          datasets: [
            {
              label: 'Distance cumulée',
              data: get(d, 'distance.day', [])
                .reduce(this.reduceCumulativeData, [])
                .map((i) => {
                  i.y = (i.y / 1000) | 0;
                  return i;
                }),
              backgroundColor: '#42A5F588',
              borderColor: '#1E88E5',
            },
          ],
        },
      },
    };
  }

  private mapDateLabelsPerDay({ _id }) {
    return new Date(_id.year, _id.month, _id.day, 12);
  }

  private mapDateLabelsPerMonth({ _id }) {
    return new Date(_id.year, _id.month, 1, 12);
  }

  private reduceCumulativeData(p, c, i) {
    p[i] = p[i] || {};
    p[i].t = new Date(c._id.year, c._id.month, c._id.day, 0, 0, 0);
    p[i].y = i > 1 ? p[i - 1].y + c.total : c.total;
    return p;
  }

  public handleChange(event, key) {
    // invert when toggle.xxx is set to true
    this.toggle[key] = !event.checked;
  }

  private getDistance(d): number {
    const dArr = get(d, 'distance.total', [{ total: 0 }]);
    if (!dArr || !dArr.length) return 0;
    if (!dArr[0] || !dArr[0].total) return 0;
    return parseInt(dArr[0].total, 10);
  }

  ngOnInit(): void {
    // nada
  }
}
