import { Component, OnInit } from '@angular/core';

import { ApiResponse } from '~/entities/responses/apiResponse';
import { STAT_MAIN } from '~/modules/statistics/config/stat_main';
import { MAIN } from '~/config/main';

import { StatisticsService } from '../../services/statisticsService';

@Component({
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})

export class StatisticsPageComponent implements OnInit {
  public loaded = false;
  apiData = {};

  statList = STAT_MAIN.main;
  gitbookLinkStats = MAIN.gitbookLinkStats;


  constructor(private statisticsService: StatisticsService) {
  }

  ngOnInit(): void {
    this.load();
  }

  private load() {
    this.statisticsService
      .get()
      .subscribe((apiData: ApiResponse) => {
        this.loaded = true;
        this.apiData = apiData.data;
      });
  }
}
