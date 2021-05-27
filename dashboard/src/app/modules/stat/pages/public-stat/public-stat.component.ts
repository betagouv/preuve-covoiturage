import { Component, Input } from '@angular/core';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { URLS } from '~/core/const/main.const';
import { PUBLIC_STATS } from '~/modules/stat/config/stat';
import { StatPublicService } from '~/modules/stat/services/stat-public.service';

@Component({
  selector: 'app-public-stat',
  templateUrl: './public-stat.component.html',
  styleUrls: ['./public-stat.component.scss'],
})
export class PublicStatComponent extends DestroyObservable {
  gitbookLinkStats = URLS.gitbookLinkStats;

  @Input() statsList = PUBLIC_STATS;

  constructor(private publicStatService: StatPublicService) {
    super();
  }

  get loading(): boolean {
    return this.publicStatService.loading;
  }

  get loaded(): boolean {
    return this.publicStatService.loaded;
  }
}
