import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { get } from 'lodash-es';

import { statGraphs } from '~/modules/stat/config/statGraphs';
import { statDataNameType } from '~/core/types/stat/statDataNameType';
import { statChartColors } from '~/modules/stat/config/statChartColors';
import { chartsType, chartType } from '~/core/types/stat/chartType';
import { statChartOptions } from '~/modules/stat/config/statChartOptions';
import { chartNamesType, chartNameType } from '~/core/types/stat/chartNameType';
import { GraphNamesInterface } from '~/core/interfaces/stat/graphNamesInterface';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { FilterService } from '~/modules/filter/services/filter.service';
import { Axes } from '~/core/interfaces/stat/formatedStatInterface';

@Component({
  selector: 'app-stat-graph',
  templateUrl: './stat-graph.component.html',
  styleUrls: ['./stat-graph.component.scss'],
})
export class StatGraphComponent extends DestroyObservable implements OnInit {
  public options: chartNamesType;

  // toggle chart to be displayed
  public toggleChart: GraphNamesInterface = {
    trips: 'monthly',
    distance: 'monthly',
    carpoolersPerVehicule: 'daily',
    carpoolers: 'monthly',
    petrol: 'monthly',
    co2: 'monthly',
  };

  // data of all charts
  public data: GraphNamesInterface;
  public graphVisible = true;
  // graph to be displayed
  public graphToBeDisplayed: statDataNameType = 'trips';
  public graphTitle = '';

  @Input() set graphName(name: statDataNameType) {
    this.displayGraph(name);
  }

  @Input() graphData: { [key in chartNameType]: Axes };

  @Input() lightMode = false;

  constructor(private filterService: FilterService) {
    super();
  }

  ngOnInit(): void {
    this.options = statChartOptions;
  }

  get hasFilters(): boolean {
    return Object.keys(this.filterService.filter$.value).length > 0;
  }

  get graphHasValues(): boolean {
    return (
      (this.isEmptyDataset(this.data.trips.daily) && this.toggleChart[this.graphToBeDisplayed] === 'daily') ||
      (this.isEmptyDataset(this.data.trips.monthly) && this.toggleChart[this.graphToBeDisplayed] === 'monthly') ||
      (this.isEmptyDataset(this.data.trips.cumulated) && this.toggleChart[this.graphToBeDisplayed] === 'cumulated')
    );
  }

  get canShowDaily(): boolean {
    return (
      this.data && !this.isEmptyDataset(this.data.trips.daily) && this.toggleChart[this.graphToBeDisplayed] === 'daily'
    );
  }

  get canShowMonthly(): boolean {
    return (
      this.data &&
      !this.isEmptyDataset(this.data.trips.monthly) &&
      this.toggleChart[this.graphToBeDisplayed] === 'monthly'
    );
  }

  get canShowCumulated(): boolean {
    return (
      this.data &&
      !this.isEmptyDataset(this.data.trips.cumulated) &&
      this.toggleChart[this.graphToBeDisplayed] === 'cumulated'
    );
  }

  private displayGraph(name: statDataNameType): void {
    this.graphToBeDisplayed = name;
    if (this.data) {
      this.graphTitle = this.data[name][this.toggleChart[name]].graphTitle;
    }
  }

  public setGraphTitle(): void {
    const graphName = this.graphToBeDisplayed;
    this.graphTitle = this.data[graphName][this.toggleChart[graphName]].graphTitle;
  }

  public isEmptyDataset(object: { datasets: { data: [] }[] }): boolean {
    return object.datasets[0].data.length > 0;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['graphData']) {
      this.graphVisible = false;
      const data: GraphNamesInterface = {
        trips: this.loadGraph('trips'),
        distance: this.loadGraph('distance'),
        carpoolers: this.loadGraph('carpoolers'),
        petrol: this.loadGraph('petrol'),
        co2: this.loadGraph('co2'),
        carpoolersPerVehicule: this.loadGraph('carpoolersPerVehicule'),
      };
      this.graphTitle = data[this.graphToBeDisplayed][this.toggleChart[this.graphToBeDisplayed]].graphTitle;
      this.data = data;

      window.requestAnimationFrame(() => (this.graphVisible = true));
    }
  }

  private loadGraph(name): chartsType {
    const ret: chartsType = {};
    if ('cumulated' in statGraphs[name]) {
      ret.cumulated = this.loadData(name, 'cumulated');
    }
    if ('monthly' in statGraphs[name]) {
      ret.monthly = this.loadData(name, 'monthly');
    }
    if ('daily' in statGraphs[name]) {
      ret.daily = this.loadData(name, 'daily');
    }

    return ret;
  }

  private loadData(name: statDataNameType, type: chartType): object {
    this.data = null;
    const graphs = statGraphs[name][type].graphs;
    const graphTitle = statGraphs[name][type].title;

    const labels = get(this.graphData, graphs[0]).x;

    // tslint:disable-next-line:ter-arrow-body-style
    const datasets = graphs.map((graphName) => {
      return {
        data: get(this.graphData, graphName).y,
        ...statChartColors[graphName],
      };
    });

    return {
      graphTitle,
      labels,
      datasets,
    };
  }
}
