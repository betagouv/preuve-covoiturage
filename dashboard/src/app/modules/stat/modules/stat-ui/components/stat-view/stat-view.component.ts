import { Component, Input, OnInit } from '@angular/core';

import { Stat } from '~/core/entities/stat/stat';
import { statDataNameType } from '~/core/types/statDataNameType';

import { StatService } from '../../../../services/stat.service';
import { mockStats } from '../../../../mocks/stats';

@Component({
  selector: 'app-stat-view',
  templateUrl: './stat-view.component.html',
  styleUrls: ['./stat-view.component.scss'],
})
export class StatViewComponent implements OnInit {
  public graphName: statDataNameType;

  constructor(public statService: StatService) {}
  @Input() statViewConfig: { names: statDataNameType[]; defaultGraphName: statDataNameType };

  ngOnInit() {
    this.initStat();
    this.graphName = this.statViewConfig.defaultGraphName;
  }

  private initStat() {
    this.statService.load().subscribe(
      () => {},
      (err) => {
        // TODO TMP DELETE WHEN BACK IS LINKED
        const stat = new Stat(mockStats);
        this.statService.formatData(stat);
      },
    );
  }

  public showGraph(graphName: string): void {
    this.graphName = <statDataNameType>graphName;
  }
}
