import { Component, Input } from '@angular/core';

import { statDataNameType } from '~/core/types/stat/statDataNameType';
import { chartNamesType, chartNameType } from '~/core/types/stat/chartNameType';
import { GraphNamesInterface } from '~/core/interfaces/stat/graphNamesInterface';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { FilterService } from '~/modules/filter/services/filter.service';
import { Axes } from '~/core/interfaces/stat/formatedStatInterface';
import { StatFilteredStoreService } from '~/modules/stat/services/stat-filtered-store.service';
import { map } from 'rxjs/operators';
import { StoreLoadingState } from '~/core/services/store/StoreLoadingState';
import { Observable } from 'rxjs';

export const secondaryColor = '#65C8CF';
export const primaryColor = '#007AD9';

export const defaultChartColors = {
  backgroundColor: secondaryColor,
  hoverBackgroundColor: secondaryColor,
  borderColor: secondaryColor,
};

@Component({
  selector: 'app-stat-graph',
  templateUrl: './stat-graph.component.html',
  styleUrls: ['./stat-graph.component.scss'],
})
export class StatGraphComponent extends DestroyObservable {
  public options: chartNamesType;

  // data of all charts
  public data: GraphNamesInterface;
  public graphVisible = false;
  @Input() graphName: statDataNameType = 'trips';

  @Input() graphData: { [key in chartNameType]: Axes };

  @Input() lightMode = false;
  cssLoadingState: Observable<string>;

  constructor(private filterService: FilterService, public store: StatFilteredStoreService) {
    super();

    this.cssLoadingState = store.listLoadingState$.pipe(
      map((loadingState) =>
        loadingState === StoreLoadingState.LoadComplete || loadingState === StoreLoadingState.Off
          ? ''
          : 'stats-graph-loading',
      ),
    );
  }
}
