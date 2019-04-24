import { Component, Input, OnInit } from '@angular/core';

import { Statistic } from '~/entities/database/statistics';
import { StatConfig } from '~/entities/stats/config';

import { STAT_STYLE } from '../../../../config/stat_style';
import { StatisticsService } from '../../../../services/statisticsService';

@Component({
  selector: 'app-statistics-graphs',
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})

export class StatisticsGraphsComponent implements OnInit {
  accumulate = {};
  accumulatedData = {};
  data = [];

  @Input() apiData = {};
  @Input() statNames = [];

  types = [
    { label: 'Cumul', value: true },
    { label: 'Par jour', value: false },
  ];

  constructor(private statisticsService: StatisticsService) {
  }

  ngOnInit(): void {
    this.loadGraphs();
  }


  private loadGraphs() {
    const stats = STAT_STYLE.details.filter(statConfig => this.statNames.indexOf(statConfig.name) !== -1);

    console.log(stats);
    for (const obj of stats) {
      if (obj.name === 'classes') {
        this.loadValidatedClassesGraph(obj);
      } else {
        this.loadDefaultDetailsGraph(obj);
      }
    }
  }


  private loadDefaultDetailsGraph(config: StatConfig) {
    // get path to map api values
    const data = this.statisticsService.getDataFromPathString(config.map, this.apiData);

    const labels = this.getLabels(data);
    const values = this.getValues(data, config);

    const graphData = {
      values,
      labels,
      name: config.name,
      cumul: config.cumul,
      type: config.type,
      title: config.title,
      options: config.options,
      datasets: [
        {
          ...config.style || {},
          data: values,
        },
      ],
    };


    this.data.push(graphData);

    const accumulatedValues = this.cumulate(values);

    this.accumulatedData[config.name] = {
      values,
      labels,
      name: config.name,
      cumul: config.cumul,
      type: config.type,
      title: config.title,
      options: config.options,
      datasets: [
        {
          ...config.style || {},
          data: accumulatedValues,
        },
      ],
    };

    this.accumulate[config.name] = true;
  }

  private loadValidatedClassesGraph(config) {
    const datas = {};
    const values = {};

    datas['A'] = this.statisticsService.getDataFromPathString('classes.a.total', this.apiData);
    datas['B'] = this.statisticsService.getDataFromPathString('classes.b.total', this.apiData);
    datas['C'] = this.statisticsService.getDataFromPathString('classes.c.total', this.apiData);
    // datas['unvalidated'] = this.statisticsService.getDataFromPathString('unvalidated.total', this.apiData);

    values['A'] = this.getValues(datas['A'], config);
    values['B'] = this.getValues(datas['B'], config);
    values['C'] = this.getValues(datas['C'], config);
    // values['unvalidated'] = this.getValues(datas['unvalidated'], config);

    const lastValues = [
      values['A'][values['A'].length - 1],
      values['B'][values['B'].length - 1],
      values['C'][values['C'].length - 1],
      // values['unvalidated'][values['unvalidated'].length - 1],
    ];

    const graphData = {
      labels: config.labels,
      type: config.type,
      title: config.title,
      options: config.options,
      unit: config.unit || '',
      datasets: [
        {
          ...config.style || {},
          data: lastValues,
        },
      ],
    };

    this.data.push(graphData);
  }


  private getLabels(values: [Statistic]) {
    return values.map((value: Statistic) => new Date(value._id.year, value._id.month - 1, value._id.day));
  }

  private getValues(values, config) {
    return values.map(value => this.statisticsService.formatUnit(value.total, config.unitTransformation, config.precision));
  }

  private cumulate(values) {
    const accumulatedValues = [];
    values.reduce((prev, curr, i) => accumulatedValues[i] = prev + curr, 0);
    return accumulatedValues;
  }
}
