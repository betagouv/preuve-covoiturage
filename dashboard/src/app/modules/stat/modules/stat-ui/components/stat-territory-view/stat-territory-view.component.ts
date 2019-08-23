import { Component, Input, OnInit } from '@angular/core';

import { Stat } from '~/core/entities/stat/stat';
import { statDataNameType } from '~/core/types/stat/statDataNameType';
import { GraphNamesInterface } from '~/core/interfaces/stat/graphNamesInterface';
import { FilterService } from '~/core/services/filter.service';
import { FilterInterface } from '~/core/interfaces/filter/filterInterface';
import { MAIN } from '~/core/const/main.const';

import { StatService } from '../../../../services/stat.service';
import { mockStats } from '../../../../mocks/stats';

@Component({
  selector: 'app-stat-territory-view',
  templateUrl: './stat-territory-view.component.html',
  styleUrls: ['./stat-territory-view.component.scss'],
})
export class StatTerritoryViewComponent implements OnInit {
  public gitbookLinkStats: string = MAIN.gitbookLinkStats;
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

  @Input() statViewConfig: { names: statDataNameType[]; defaultGraphName: statDataNameType };

  constructor(public statService: StatService, public filterService: FilterService) {}

  ngOnInit() {
    this.resetSelected();
    this.graphName = this.statViewConfig.defaultGraphName;
    this.selected.trips = true;
    this.filterService._filter$.subscribe((filter: FilterInterface) => {
      this.loadStat(filter);
    });
  }

  private loadStat(filter: FilterInterface = {}): void {
    if (this.statService.loading) {
      return;
    }
    this.statService.loadOne(filter).subscribe(
      () => {},
      (err) => {
        // TODO TMP DELETE WHEN BACK IS LINKED
        const stat = new Stat(mockStats);
        this.statService.formatData(stat);
      },
    );
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
    const offsetTop = document.getElementById('graph').offsetTop;
    document.getElementsByClassName('AuthenticatedLayout-body')[0].scrollTop = offsetTop;
  }
}
