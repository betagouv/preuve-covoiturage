import { Component, Input, OnInit } from '@angular/core';

import { statDataNameType } from '~/core/types/stat/statDataNameType';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { chartNameType } from '~/core/types/stat/chartNameType';
import { Axes } from '~/core/interfaces/stat/formatedStatInterface';
import { takeUntil } from 'rxjs/operators';
import { StatFilteredStoreService } from '~/modules/stat/services/stat-filtered-store.service';

// this component displays a non filtered graph
@Component({
  selector: 'app-stat-graph-view',
  templateUrl: './stat-graph-view.component.html',
  styleUrls: ['./stat-graph-view.component.scss'],
})
export class StatGraphViewComponent extends DestroyObservable implements OnInit {
  @Input() graphName: statDataNameType;
  graphData: { [key in chartNameType]: Axes } = null;

  constructor(public statService: StatFilteredStoreService) {
    super();
  }

  ngOnInit(): void {
    this.loadStat();
  }

  private loadStat(): void {
    this.statService.stat$.pipe(takeUntil(this.destroy$)).subscribe((stats) => {
      if (stats) {
        this.graphData = stats.graph;
      }
    });

    // reset stats on load
    this.statService.init();
    this.statService.load();
  }
}
