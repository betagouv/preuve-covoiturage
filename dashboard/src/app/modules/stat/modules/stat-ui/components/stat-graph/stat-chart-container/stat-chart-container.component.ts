import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-stat-chart-container',
  templateUrl: './stat-chart-container.component.html',
  styleUrls: ['./stat-chart-container.component.scss'],
})
export class StatChartContainerComponent implements OnInit {
  @Input() showDaily: boolean;
  @Input() showMonthly: boolean;
  @Input() showCumulated: boolean;

  @Input() hasFilters: boolean;

  constructor() {}

  ngOnInit(): void {}
}
