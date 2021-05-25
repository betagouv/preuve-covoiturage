import { Component, OnInit } from '@angular/core';
import { FilterService } from './../../../../../../filter/services/filter.service';

@Component({
  selector: 'app-stat-chart-container',
  templateUrl: './stat-chart-container.component.html',
  styleUrls: ['./stat-chart-container.component.scss'],
})
export class StatChartContainerComponent implements OnInit {
  constructor(public filterService: FilterService) {}

  ngOnInit(): void {}

  get hasFilters(): boolean {
    return Object.keys(this.filterService.filter$.value).length > 0;
  }
}
