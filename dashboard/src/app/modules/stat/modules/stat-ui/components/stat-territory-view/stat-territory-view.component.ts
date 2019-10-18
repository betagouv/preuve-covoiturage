import { Component, Input, OnInit } from '@angular/core';
import { take, takeUntil } from 'rxjs/operators';

import { statDataNameType } from '~/core/types/stat/statDataNameType';
import { GraphNamesInterface } from '~/core/interfaces/stat/graphNamesInterface';
import { FilterService } from '~/core/services/filter.service';
import { FilterUxInterface } from '~/core/interfaces/filter/filterUxInterface';
import { URLS } from '~/core/const/main.const';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { TERRITORY_STATS } from '~/modules/stat/config/stat';

import { StatService } from '../../../../services/stat.service';

@Component({
  selector: 'app-stat-territory-view',
  templateUrl: './stat-territory-view.component.html',
  styleUrls: ['./stat-territory-view.component.scss'],
})
export class StatTerritoryViewComponent extends DestroyObservable implements OnInit {
  public gitbookLinkStats: string = URLS.gitbookLinkStats;
  public graphName: statDataNameType;
  public selected: GraphNamesInterface;
  public disabled: GraphNamesInterface = {
    carpoolers: false,
    carpoolersPerVehicule: false,
    co2: false,
    distance: false,
    petrol: false,
    trips: false,
    operators: true,
  };

  statViewConfig = TERRITORY_STATS;

  constructor(public statService: StatService, public filterService: FilterService) {
    super();
  }

  ngOnInit() {
    this.resetSelected();
    this.graphName = this.statViewConfig.defaultGraphName;
    this.selected.trips = true;
    this.filterService.filter$.pipe(takeUntil(this.destroy$)).subscribe((filter: FilterUxInterface) => {
      this.loadStat(filter);
    });
  }

  get loading(): boolean {
    return this.statService.loading;
  }

  get loaded(): boolean {
    return this.statService.loaded;
  }

  private loadStat(filter: FilterUxInterface | {} = {}): void {
    if (this.statService.loading) {
      return;
    }
    this.statService
      .loadOne(filter)
      .pipe(take(1))
      .subscribe();
  }

  /**
   * select graph to be displayed
   */
  public showGraph(graphName: string): void {
    this.graphName = <statDataNameType>graphName;
    this.resetSelected();
    this.selected[graphName] = true;
    this.scrollToTop();
  }

  public resetSelected(): void {
    this.selected = {
      carpoolers: false,
      carpoolersPerVehicule: false,
      co2: false,
      distance: false,
      petrol: false,
      trips: false,
    };
  }

  /**
   * scroll to top of div.AuthenticatedLayout-body
   */
  public scrollToTop(): void {
    document.getElementsByClassName('AuthenticatedLayout-body')[0].scrollTop = 0;
  }
}
