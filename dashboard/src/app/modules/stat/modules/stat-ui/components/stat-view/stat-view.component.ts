import { Component, Input, OnInit } from '@angular/core';

import { Stat } from '~/core/entities/stat/stat';
import { statDataNameType } from '~/core/types/stat/statDataNameType';
import { GraphNamesInterface } from '~/core/interfaces/stat/graphNamesInterface';

import { StatService } from '../../../../services/stat.service';
import { mockStats } from '../../../../mocks/stats';

@Component({
  selector: 'app-stat-view',
  templateUrl: './stat-view.component.html',
  styleUrls: ['./stat-view.component.scss'],
})
export class StatViewComponent implements OnInit {
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

  constructor(public statService: StatService) {}
  @Input() statViewConfig: { names: statDataNameType[]; defaultGraphName: statDataNameType };

  ngOnInit() {
    this.resetSelected();
    this.initStat();
    this.graphName = this.statViewConfig.defaultGraphName;
    this.selected.trips = true;
  }

  private initStat(): void {
    this.statService.load().subscribe(
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
