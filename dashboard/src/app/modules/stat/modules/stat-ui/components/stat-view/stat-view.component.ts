import { Component, Input } from '@angular/core';

import { StatNavName } from '~/core/types/stat/statDataNameType';
import { FilterService } from '~/modules/filter/services/filter.service';
import { URLS } from '~/core/const/main.const';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { PUBLIC_STATS } from '~/modules/stat/config/stat';

import { StatFilteredStoreService } from '../../../../services/stat-filtered-store.service';

@Component({
  selector: 'app-stat-view',
  templateUrl: './stat-view.component.html',
  styleUrls: ['./stat-view.component.scss'],
})
export class StatViewComponent extends DestroyObservable {
  public gitbookLinkStats: string = URLS.gitbookLinkStats;

  @Input() navList = PUBLIC_STATS;
  public graphName: StatNavName = this.navList[0];

  constructor(public statService: StatFilteredStoreService, public filterService: FilterService) {
    super();
  }

  get loading(): boolean {
    return this.statService.isLoading;
  }

  get loaded(): boolean {
    return !!this.statService.stat;
  }

  /**
   * scroll to top of div.AuthenticatedLayout-body
   */
  public scrollToTop(): void {
    document.getElementsByClassName('AuthenticatedLayout-body')[0].scrollTop = 0;
  }
}
