import { Component, OnInit } from '@angular/core';

import { StatNavName } from '~/core/types/stat/statDataNameType';
import { FilterService } from '~/modules/filter/services/filter.service';
import { URLS } from '~/core/const/main.const';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { TERRITORY_STATS } from '~/modules/stat/config/stat';

import { StatFilteredStoreService } from '../../../../services/stat-filtered-store.service';

@Component({
  selector: 'app-stat-territory-view',
  templateUrl: './stat-territory-view.component.html',
  styleUrls: ['./stat-territory-view.component.scss'],
})
export class StatTerritoryViewComponent extends DestroyObservable implements OnInit {
  public gitbookLinkStats: string = URLS.gitbookLinkStats;

  // public selected: GraphNamesInterface;
  // public disabled: GraphNamesInterface = {
  //   carpoolers: false,
  //   carpoolersPerVehicule: false,
  //   co2: false,
  //   distance: false,
  //   petrol: false,
  //   trips: false,
  //   operators: true,
  // };
  // graphData: { [key in chartNameType]: Axes } = null;

  navList = TERRITORY_STATS;
  public graphName: StatNavName = TERRITORY_STATS[0];

  //  statIsLoading: Observable<boolean>;

  constructor(public statService: StatFilteredStoreService, public filterService: FilterService) {
    super();

    // this.statIsLoading = statService.listLoadingState$.pipe(
    //   map((state) => state === StoreLoadingState.Debounce || state === StoreLoadingState.LoadStart),
    // );
  }

  ngOnInit(): void {
    // this.resetSelected();
    // this.graphName = this.navList[0];
    // this.selected.trips = true;
    // reset stats on load
    // this.statService.init();
    // this.filterService.filter$.pipe(takeUntil(this.destroy$)).subscribe((filter: FilterUxInterface) => {
    //   this.loadStat(filter);
    // });
    // this.statService.stat$.pipe(takeUntil(this.destroy$)).subscribe((stats) => {
    //   if (stats) {
    //     this.graphData = stats.graph;
    //   }
    // });
  }

  get loading(): boolean {
    return this.statService.isLoading;
  }

  get loaded(): boolean {
    return !!this.statService.stat;
  }

  // statSelected(selectedStat) {
  //   this.graphName = selectedStat;
  // }

  // private loadStat(filter: FilterUxInterface | {} = {}): void {
  //   if (this.statService.isLoading) {
  //     return;
  //   }
  //   this.statService.load(filter);
  // }

  /**
   * select graph to be displayed
   */
  // public showGraph(graphName: string): void {
  //   this.graphName = graphName as statDataNameType;
  //   this.resetSelected();
  //   this.selected[graphName] = true;
  //   this.scrollToTop();
  // }

  // public resetSelected(): void {
  //   this.selected = {
  //     carpoolers: false,
  //     carpoolersPerVehicule: false,
  //     co2: false,
  //     distance: false,
  //     petrol: false,
  //     trips: false,
  //   };
  // }

  /**
   * scroll to top of div.AuthenticatedLayout-body
   */
  public scrollToTop(): void {
    document.getElementsByClassName('AuthenticatedLayout-body')[0].scrollTop = 0;
  }
}
