import { Component, Input, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import { statDataNameType } from '~/core/types/stat/statDataNameType';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { StatStoreService } from '~/modules/stat/services/stat-store.service';
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

  constructor(public statService: StatStoreService) {
    super();
  }

  ngOnInit(): void {
    this.loadStat();
  }

  get loading(): boolean {
    return this.statService.isLoading;
  }

  get loaded(): boolean {
    return !!this.statService.stat;
  }

  private loadStat(): void {
    this.statService.stat$.pipe(takeUntil(this.destroy$)).subscribe((stats) => {
      if (stats) {
        this.graphData = stats.graph;
      }
    });

    if (this.loading || this.loaded) {
      return;
    }

    // reset stats on load
    this.statService.init();
    this.statService.load();
  }
}
