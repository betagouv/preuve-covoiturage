import { Component, Input, OnInit } from '@angular/core';
import { take, takeUntil } from 'rxjs/operators';

import { URLS } from '~/core/const/main.const';
import { statDataNameType } from '~/core/types/stat/statDataNameType';
import { GraphNamesInterface } from '~/core/interfaces/stat/graphNamesInterface';
import { StatFilteredService } from '~/modules/stat/services/stat-filtered.service';
import { FilterService } from '~/modules/filter/services/filter.service';
import { FilterUxInterface } from '~/core/interfaces/filter/filterUxInterface';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { OPERATOR_STATS, TERRITORY_STATS } from '~/modules/stat/config/stat';
import { chartNameType } from '~/core/types/stat/chartNameType';
import { Axes } from '~/core/interfaces/stat/formatedStatInterface';

@Component({
  selector: 'app-stat-operator-view',
  templateUrl: './stat-operator-view.component.html',
  styleUrls: ['./stat-operator-view.component.scss'],
})
export class StatOperatorViewComponent extends DestroyObservable implements OnInit {
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
  };
  graphData: { [key in chartNameType]: Axes } = null;

  statViewConfig = OPERATOR_STATS;

  constructor(public statService: StatFilteredService, public filterService: FilterService) {
    super();
  }

  ngOnInit() {
    this.resetSelected();
    this.graphName = this.statViewConfig.defaultGraphName;
    this.selected.trips = true;

    // reset stats on load
    this.statService.init();

    this.filterService.filter$.pipe(takeUntil(this.destroy$)).subscribe((filter: FilterUxInterface) => {
      this.loadStat(filter);
    });
    this.statService.stat$.pipe(takeUntil(this.destroy$)).subscribe((stats) => {
      if (stats) {
        this.graphData = stats.graph;
      }
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
    this.statService.loadOne(filter).subscribe();
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
