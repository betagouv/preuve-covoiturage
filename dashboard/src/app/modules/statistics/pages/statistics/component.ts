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
  apiData: any = {};

  statList = STAT_MAIN.main;
  gitbookLinkStats = MAIN.gitbookLinkStats;

  constructor(private statisticsService: StatisticsService) {}

  ngOnInit(): void {
    this.load();
  }

  private load() {
    this.statisticsService.get().subscribe((apiData: ApiResponse) => {
      this.loaded = true;
      const { data } = apiData;
      this.data = {
        summary: {
          journeys: data.collected.total,
          distance: parseInt(data.distance.total[0].total, 10) / 1000 | 0,
          aom: 3,
          petrol: parseInt(data.distance.total[0].total, 10) * 0.0000636 | 0,
          co2: parseInt(data.distance.total[0].total, 10) * 0.000195 | 0,
        },
      };
    });
  }
}
