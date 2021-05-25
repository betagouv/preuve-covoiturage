import { Component, Input, OnInit } from '@angular/core';
import { GraphTimeMode } from '../../../GraphTimeMode';

@Component({
  selector: 'app-stat-chart-container',
  templateUrl: './stat-chart-container.component.html',
  styleUrls: ['./stat-chart-container.component.scss'],
})
export class StatChartContainerComponent implements OnInit {
  @Input() nav: string = GraphTimeMode.Month;

  @Input() hasFilters: boolean = false;

  constructor() {}

  ngOnInit(): void {}
}
