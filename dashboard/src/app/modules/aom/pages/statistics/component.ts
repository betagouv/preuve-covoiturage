import { Component, OnInit } from '@angular/core';

import { ApiResponse } from '~/entities/responses/apiResponse';
import { STAT_MAIN } from '~/modules/statistics/config/stat_main';
import { AomService } from '~/modules/aom/services/aomService';
import { AuthenticationService } from '~/applicativeService/authentication/service';
import { Aom } from '~/entities/database/aom';
import { MAIN } from '~/config/main';


@Component({
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})

export class AomStatisticsComponent implements OnInit {
  public loaded = false;
  apiData = {};
  aom: Aom = new Aom();

  statList = STAT_MAIN.aom;
  gitbookLinkStats = MAIN.gitbookLinkStats;

  constructor(
    private aomService: AomService,
    private authenticationService: AuthenticationService,
  ) {
  }

  ngOnInit(): void {
    const user = this.authenticationService.getUser();
    if (user.aom) {
      this.aom._id = user.aom;
      this.load();
    }
  }

  private load() {
    this.aomService
      .getStats(this.aom._id)
      .subscribe((apiData: ApiResponse) => {
        this.loaded = true;
        this.apiData = apiData.data;
      });
  }
}
