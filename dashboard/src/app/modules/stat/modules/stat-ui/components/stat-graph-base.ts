import { Component, OnInit } from '@angular/core';
import { GraphTimeMode } from '../GraphTimeMode';

@Component({
  selector: 'app-stat-graph-base',
  template: '<strong>app-stat-graph-base is abstract do not implement</strong>',
})
export abstract class StatGraphBase implements OnInit {
  constructor() {}

  abstract displayNav: boolean;

  timeMode = GraphTimeMode.Month;

  title = '';

  navChange(timeMode: GraphTimeMode): void {
    this.timeMode = timeMode;
    this.setGraphTitle();
  }

  abstract setGraphTitle(): void;

  ngOnInit(): void {
    this.setGraphTitle();
  }
}
