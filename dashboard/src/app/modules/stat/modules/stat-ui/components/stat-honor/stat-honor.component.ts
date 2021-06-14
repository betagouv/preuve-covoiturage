import { Component, OnInit } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { commonOptions } from '~/modules/stat/config/statChartOptions';
import { StatHonorService } from '~/modules/stat/services/stat-honor.service';

@Component({
  selector: 'app-stat-honor',
  templateUrl: './stat-honor.component.html',
  styleUrls: ['./stat-honor.component.scss'],
})
export class StatHonorComponent implements OnInit {
  public options: ChartOptions = commonOptions;

  get data(): ChartData | null {
    return this.api.stats;
  }

  constructor(private api: StatHonorService) {}

  ngOnInit(): void {
    // merge options
    // set(this.options, 'scales.yAxes[0].stacked', true);
    // set(this.options, 'legend.display', true);

    // fetch data from API
    this.api.fetch([
      {
        order: 1,
        label: 'Secteur public',
        backgroundColor: '#65C8CF',
      },
      {
        order: 0,
        label: 'Secteur privé',
        backgroundColor: '#007AD9',
      },
    ]);
  }
}
