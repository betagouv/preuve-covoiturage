import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GraphTimeMode } from '../GraphTimeMode';

@Component({
  selector: 'app-stat-graph-base',
  template: '<strong>app-stat-graph-base is abstract do not implement</strong>',
})
export abstract class StatGraphBase implements OnInit {
  constructor() {}

  @Input() displayNav = true;
  // abstract displayNav: boolean;
  @Output() titleUpdate = new EventEmitter<string>();

  timeMode = GraphTimeMode.Month;

  navChange(timeMode: GraphTimeMode): void {
    this.timeMode = timeMode;
    this.graphTitle();
  }

  abstract graphTitle(): string;

  protected updateGraphTitle(): void {
    this.titleUpdate.emit(this.graphTitle());
  }

  ngOnInit(): void {
    this.graphTitle();
  }
}
