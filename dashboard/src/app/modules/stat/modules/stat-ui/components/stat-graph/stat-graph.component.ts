import { Component, Input, OnInit } from '@angular/core';
import { get } from 'lodash';

import { statGraphs, statChartStyles } from '~/modules/stat/config/statGraphs';
import { StatService } from '~/modules/stat/services/stat.service';
import { GraphNamesInterface } from '~/core/interfaces/stat/graphInterface';
import { statDataNameType } from '~/core/types/statDataNameType';

@Component({
  selector: 'app-stat-graph',
  templateUrl: './stat-graph.component.html',
  styleUrls: ['./stat-graph.component.scss'],
})
export class StatGraphComponent implements OnInit {
  public options = {
    scales: {
      xAxes: [
        {
          type: 'time',
          time: {
            unit: 'month',
            locale: 'fr',
          },
          stacked: true,
          gridLines: {
            display: false,
            drawBorder: false,
          },
          offset: true,
        },
      ],
      yAxes: [
        {
          gridLines: {
            display: false,
            drawBorder: false,
          },
          stacked: false,
          ticks: {
            display: false,
          },
        },
      ],
    },
    legend: {
      position: 'top',
      labels: {
        boxWidth: 12,
      },
    },
  };

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
    this.initCharts();
  }

  private displayGraph(name: statDataNameType) {
    this._displayGraph = name;
    if (this.data) {
      // todo: fix this with async
      this.graphTitle = this.data[name][this.toggleChart[name]].title;
    }
  }

  private initCharts() {
    const data: GraphNamesInterface = {
      trips: this.loadGraph('trips'),
      distance: this.loadGraph('distance'),
      carpoolers: this.loadGraph('carpoolers'),
      petrol: this.loadGraph('petrol'),
      co2: this.loadGraph('co2'),
      carpoolersPerVehicule: this.loadGraph('carpoolersPerVehicule'),
    };
    this.graphTitle = data.trips.monthly.title;
    this.data = data;
  }

  private loadGraph(name) {
    const ret: { cumulated?: object; monthly?: object; daily?: object } = {};
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

  private loadData(name, type) {
    const graphs = statGraphs[name][type].graphs;
    const graphTitle = statGraphs[name][type].title;

    const labels = get(this.statService.stat.graph, graphs[0]).x;

    // tslint:disable-next-line:ter-arrow-body-style
    const datasets = graphs.map((graphName) => {
      return {
        data: get(this.statService.stat.graph, graphName).y,
        ...statChartStyles[graphName],
      };
    });
    return {
      graphTitle,
      labels,
      datasets,
    };
  }
}
