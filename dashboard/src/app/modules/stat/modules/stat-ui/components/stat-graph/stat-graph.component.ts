import { Component, Input, OnInit } from '@angular/core';
import { get } from 'lodash';

import { statGraphs } from '~/modules/stat/config/statGraphs';
import { StatService } from '~/modules/stat/services/stat.service';
import { statDataNameType } from '~/core/types/stat/statDataNameType';
import { statChartColors } from '~/modules/stat/config/statChartColors';
import { chartsType, chartType } from '~/core/types/stat/chartType';
import { statChartOptions } from '~/modules/stat/config/statChartOptions';
import { chartNamesType } from '~/core/types/stat/chartNameType';
import { GraphNamesInterface } from '~/core/interfaces/stat/graphNamesInterface';

@Component({
  selector: 'app-stat-graph',
  templateUrl: './stat-graph.component.html',
  styleUrls: ['./stat-graph.component.scss'],
})
export class StatGraphComponent implements OnInit {
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

  // graph to be displayed
  public _displayGraph: statDataNameType = 'trips';
  public graphTitle = '';

  @Input() set graphName(name: statDataNameType) {
    this.displayGraph(name);
  }

  constructor(private statService: StatService) {}

  ngOnInit() {
    this.options = statChartOptions;

    const data: GraphNamesInterface = {
      trips: this.loadGraph('trips'),
      distance: this.loadGraph('distance'),
      carpoolers: this.loadGraph('carpoolers'),
      petrol: this.loadGraph('petrol'),
      co2: this.loadGraph('co2'),
      carpoolersPerVehicule: this.loadGraph('carpoolersPerVehicule'),
    };
    console.log(data);
    this.graphTitle = data.trips.monthly.graphTitle;
    this.data = data;
  }

  private displayGraph(name: statDataNameType): void {
    this._displayGraph = name;
    if (this.data) {
      this.graphTitle = this.data[name][this.toggleChart[name]].graphTitle;
    }
  }

  public setGraphTitle(): void {
    const graphName = this._displayGraph;
    this.graphTitle = this.data[graphName][this.toggleChart[graphName]].graphTitle;
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
    const graphs = statGraphs[name][type].graphs;
    const graphTitle = statGraphs[name][type].title;

    const labels = get(this.statService.stat.graph, graphs[0]).x;

    // tslint:disable-next-line:ter-arrow-body-style
    const datasets = graphs.map((graphName) => {
      return {
        data: get(this.statService.stat.graph, graphName).y,
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
