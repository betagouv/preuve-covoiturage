import { Component, OnInit } from '@angular/core';

import { Statistic } from '~/entities/database/statistics';
import { ApiResponse } from '~/entities/responses/apiResponse';
import { StatConfig } from '~/entities/stats/config';

import { STAT_STYLE } from '../../config/stat_style';
import { STAT_MAIN } from '../../config/stat_main';
import { StatisticsService } from '../../services/statisticsService';

@Component({
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})

export class StatisticsPageComponent implements OnInit {
  constructor(private statisticsService: StatisticsService) {
  }

  accumulate = {};


  types = [
    { label: 'Cumul', value: true },
    { label: 'Par jour', value: false },
  ];

  apiData = {};


  data = {
    resume: [],
    details: [],
  };

  accumulatedData = {};

  ngOnInit(): void {
    this.load();
  }

  private load() {
    this.statisticsService.get().subscribe((apiData: ApiResponse) => {
      this.apiData = apiData.data;
      this.loadResumeGraphs();
      this.loadDetailsGraphs();
    });
  }

  private loadResumeGraphs() {
    for (const obj of STAT_STYLE.resume) {
      if (obj.name === 'aomTotal') {
        this.loadAomResumeGraph(obj);
      } else {
        this.loadDefaultResumeGraph(obj, 'resume');
      }
    }
  }

  private loadDetailsGraphs() {
    for (const obj of STAT_STYLE.details) {
      if (obj.name === 'classes') {
        this.loadValidatedClassesGraph(obj, 'details');
      } else {
        this.loadDefaultDetailsGraph(obj, 'details');
      }
    }
  }


  private loadDefaultResumeGraph(config: StatConfig, category) {
    // get path to map api values
    const data = this.getDataFromPathString(config.map);
    const values = this.getValues(data, config);
    const lastValue = values[values.length - 1];
    const graphData = {
      lastValue,
      type: config.type,
      title: config.title,
      options: config.options,
      img: config.img || null,
      unit: config.unit || '',
      datasets: [
        {
          ...config.style || {},
          data : values,
        },
      ],
    };


    this.data[category].push(graphData);
  }

  private loadDefaultDetailsGraph(config: StatConfig, category) {
    // get path to map api values
    const data = this.getDataFromPathString(config.map);

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
          data : values,
        },
      ],
    };


    this.data[category].push(graphData);

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
          data : accumulatedValues,
        },
      ],
    };

    this.accumulate[config.name] = false;
  }

  private loadValidatedClassesGraph(config, category) {
    const datas = {};
    const values = {};

    datas['A'] = this.getDataFromPathString('classes.a.total');
    datas['B'] = this.getDataFromPathString('classes.b.total');
    datas['C'] = this.getDataFromPathString('classes.c.total');
    datas['unvalidated'] = this.getDataFromPathString('unvalidated.total');


    values['A'] = this.getValues(datas['A'], config);
    values['B'] = this.getValues(datas['B'], config);
    values['C'] = this.getValues(datas['C'], config);
    values['unvalidated'] = this.getValues(datas['unvalidated'], config);

    const lastValues = [
      values['A'][values['A'].length - 1],
      values['B'][values['B'].length - 1],
      values['C'][values['C'].length - 1],
      values['unvalidated'][values['unvalidated'].length - 1],
    ];

    const graphData = {
      labels: config.labels,
      type: config.type,
      title: config.title,
      options: config.options,
      img: config.img || null,
      unit: config.unit || '',
      datasets: [
        {
          ...config.style || {},
          data : lastValues,
        },
      ],
    };

    this.data[category].push(graphData);
  }

  private loadAomResumeGraph(config) {
    const graphData = {
      lastValue: STAT_MAIN.number_aom,
      type: config.type,
      title: config.title,
      options: config.options,
      img: config.img || null,
      unit: config.unit || '',
    };


    this.data['resume'].push(graphData);
  }


  private getDataFromPathString(str): [Statistic] {
    const path = str.split('.');
    let ret: any = [];
    Object.assign(ret, this.apiData);
    for (const val of path) {
      if (ret[val]) {
        ret = ret[val];
      }
    }
    return ret;
  }

  private getLabels(values: [Statistic]) {
    return values.map((value: Statistic) => new Date(value._id.year, value._id.month - 1, value._id.day - 1));
  }

  private getValues(values, config) {
    return values.map(value => this.formatUnit(value.total, config.unitTransformation, config.precision));
  }

  private formatUnit(value, transformation = null, precision = null) {
    let retValue = value;
    if (transformation) {
      retValue = this.transformUnit(retValue, transformation);
    }
    return (precision !== null) ? retValue.toFixed(precision) : Math.floor(retValue) ;
  }

  private transformUnit(value, transformation) {
    // operation format: '/123, *123'
    const type = transformation.split('')[0];
    const num = Number(transformation.substring(1));
    switch (type) {
      case '/' :
        return value / num;
      case '*' :
        return value * num;
    }
  }

  private cumulate(values) {
    const accumulatedValues = [];
    values.reduce((prev, curr, i) => accumulatedValues[i] = prev + curr , 0);
    return accumulatedValues;
  }
}
