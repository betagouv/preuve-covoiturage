import { Component, Input, OnInit } from '@angular/core';

import { StatConfig } from '~/entities/stats/config';

import { STAT_STYLE } from '../../../../config/stat_style';
import { STAT_MAIN } from '../../../../config/stat_main';
import { StatisticsService } from '../../../../services/statisticsService';

@Component({
  selector: 'app-statistics-resume',
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})
export class StatisticsResumeComponent implements OnInit {
  data = [];

  @Input() apiData = {};
  @Input() statNames = [];

  types = [
    { label: 'Cumul', value: true },
    { label: 'Par jour', value: false },
  ];

  constructor(private statisticsService: StatisticsService) {}

  ngOnInit(): void {
    this.loadResumeGraphs();
  }

  private loadResumeGraphs() {
    const stats = STAT_STYLE.resume.filter(
      (statConfig) => this.statNames.indexOf(statConfig.name) !== -1,
    );
    for (const obj of stats) {
      if (obj.name === 'aomTotal') {
        this.loadAomResumeGraph(obj);
      } else {
        this.loadDefaultResumeGraph(obj);
      }
    }
  }

  private loadDefaultResumeGraph(config: StatConfig) {
    // get path to map api values
    const data = this.statisticsService.getDataFromPathString(
      config.map,
      this.apiData,
    );
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
          ...(config.style || {}),
          data: values,
        },
      ],
    };

    this.data.push(graphData);
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

    this.data.push(graphData);
  }

  private getValues(values, config) {
    return values.map((value) =>
      this.statisticsService.formatUnit(
        value.total,
        config.unitTransformation,
        config.precision,
      ),
    );
  }
}
