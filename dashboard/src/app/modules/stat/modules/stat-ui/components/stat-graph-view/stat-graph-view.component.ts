import { Component, Input, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import { statDataNameType } from '~/core/types/stat/statDataNameType';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { StatService } from '~/modules/stat/services/stat.service';
import { chartNameType } from '~/core/types/stat/chartNameType';
import { Axes } from '~/core/interfaces/stat/formatedStatInterface';

// this component displays a non filtered graph
@Component({
  selector: 'app-stat-graph-view',
  templateUrl: './stat-graph-view.component.html',
  styleUrls: ['./stat-graph-view.component.scss'],
})
export class StatGraphViewComponent extends DestroyObservable implements OnInit {
  @Input() graphName: statDataNameType;
  graphData: { [key in chartNameType]: Axes } = null;

  constructor(public statService: StatService) {
    super();
  }

  ngOnInit() {
    this.loadStat();
  }

  get loading(): boolean {
    return this.statService.loading;
  }

  get loaded(): boolean {
    return this.statService.loaded;
  }

  private loadStat(): void {
    this.statService.stat$.pipe(takeUntil(this.destroy$)).subscribe((stats) => {
      if (stats) {
        this.graphData = stats.graph;
      }
    });

    if (this.statService.loading || this.statService.loaded) {
      return;
    }

    // reset stats on load
    this.statService.init();

    this.statService.loadOne().subscribe();
  }
}
