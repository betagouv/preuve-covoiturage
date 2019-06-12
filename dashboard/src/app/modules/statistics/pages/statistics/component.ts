// tslint:disable: no-bitwise
import { Component, OnInit } from '@angular/core';

import { ApiResponse } from '~/entities/responses/apiResponse';
import { environment } from '~/../environments/environment';

import { StatisticsService } from '../../services/statisticsService';

@Component({
  templateUrl: 'template.html',
})
export class StatisticsPageComponent implements OnInit {
  public apiData = {};
  public isProduction = environment.name === 'production';

  constructor(private statisticsService: StatisticsService) {}
  ngOnInit(): void {
    this.fetchData();
  }

  private fetchData() {
    this.statisticsService.get().subscribe((response: ApiResponse) => {
      this.apiData = response.data;
    });
  }
}
