import { Component, Input, OnInit } from '@angular/core';

import { StatNavName } from '~/core/types/stat/statDataNameType';
import { FilterService } from '~/modules/filter/services/filter.service';
import { URLS } from '~/core/const/main.const';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { PUBLIC_STATS } from '~/modules/stat/config/stat';

import { StatFilteredStoreService } from '../../../../services/stat-filtered-store.service';
import { takeUntil } from 'rxjs/operators';
import { FilterUxInterface } from '../../../../../../core/interfaces/filter/filterUxInterface';
import { StatPublicService } from '../../../../services/stat-public.service';
import { StatInterface } from '../../../../../../core/interfaces/stat/StatInterface';

@Component({
  selector: 'app-stat-view',
  templateUrl: './stat-view.component.html',
  styleUrls: ['./stat-view.component.scss'],
})
export class StatViewComponent extends DestroyObservable implements OnInit {
  public gitbookLinkStats: string = URLS.gitbookLinkStats;

  @Input() navList = PUBLIC_STATS;
  @Input() isPublic = false;
  public graphName: StatNavName = this.navList[0];

  constructor(public statService: StatFilteredStoreService) {
    super();
  }

  ngOnInit(): void {
    this.statService.isPublic = this.isPublic;
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
