import { Component, OnInit } from '@angular/core';

import { ApiResponse } from '~/entities/responses/apiResponse';
import { AomService } from '~/modules/aom/services/aomService';
import { AuthenticationService } from '~/applicativeService/authentication/service';
import { Aom } from '~/entities/database/aom';

@Component({
  template: '<app-stats-content [apiData]="apiData"></app-stats-content>',
  // styleUrls: ['style.scss'],
})
export class AomStatisticsComponent implements OnInit {
  public apiData = {};
  aom: Aom = new Aom();

  constructor(
    private aomService: AomService,
    private authenticationService: AuthenticationService,
  ) {}

  ngOnInit(): void {
    const user = this.authenticationService.getUser();
    if (user.aom) {
      this.aom._id = user.aom;
      this.fetchData();
    }
  }

  private fetchData() {
    this.aomService.getStats(this.aom._id).subscribe((apiData: ApiResponse) => {
      this.apiData = apiData.data;
    });
  }
}
