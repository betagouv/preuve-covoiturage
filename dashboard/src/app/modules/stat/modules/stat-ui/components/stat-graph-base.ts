import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ApiGraphTimeMode, StatFilteredStoreService } from '~/modules/stat/services/stat-filtered-store.service';
import { GraphTimeMode } from '../GraphTimeMode';

@Component({
  selector: 'app-stat-graph-base',
  template: '<strong>app-stat-graph-base is abstract do not implement</strong>',
})
export abstract class StatGraphBase implements OnInit {
  @Input() displayNav = true;
  // abstract displayNav: boolean;
  @Output() titleUpdate = new EventEmitter<string>();

  timeMode = GraphTimeMode.Month;

  constructor(protected statStore: StatFilteredStoreService) {
    console.log('>> constructor');
    this.updateStoreTimeMode();
  }

  navChange(timeMode: GraphTimeMode): void {
    this.timeMode = timeMode;
    this.graphTitle();

    this.updateStoreTimeMode();
  }

  protected updateStoreTimeMode(): void {
    // month use api group by month other mode use day grouped data
    const apiGraphTimeMode = this.timeMode === GraphTimeMode.Month ? ApiGraphTimeMode.Month : ApiGraphTimeMode.Day;

    if (apiGraphTimeMode !== this.statStore.timeModeSubject.value) {
      this.statStore.timeModeSubject.next(apiGraphTimeMode);
    }
  }

  abstract graphTitle(): string;

  protected updateGraphTitle(): void {
    this.titleUpdate.emit(this.graphTitle());
  }

  ngOnInit(): void {
    this.graphTitle();
  }
}
