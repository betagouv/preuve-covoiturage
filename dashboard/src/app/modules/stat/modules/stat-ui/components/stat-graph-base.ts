import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { StatFilteredStoreService } from '~/modules/stat/services/stat-filtered-store.service';
import { ApiGraphTimeMode } from '~/modules/stat/services/ApiGraphTimeMode';
import { GraphTimeMode } from '../GraphTimeMode';
import { StatInterface } from '~/core/interfaces/stat/StatInterface';
import { FormatedStatInterface } from '~/core/interfaces/stat/formatedStatInterface';
import { map, takeUntil } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { DestroyObservable } from '~/core/components/destroy-observable';

export const secondaryColor = '#65C8CF';
export const primaryColor = '#007AD9';

@Component({
  selector: 'app-stat-graph-base',
  template: '<strong>app-stat-graph-base is abstract do not implement</strong>',
})
export abstract class StatGraphBase extends DestroyObservable implements OnInit {
  @Input() displayNav = true;
  @Output() titleUpdate = new EventEmitter<string>();

  timeMode = GraphTimeMode.Month;

  protected dataSubject = new BehaviorSubject<FormatedStatInterface>(null);

  get data$(): Observable<FormatedStatInterface> {
    return this.dataSubject;
  }

  constructor(public statStore: StatFilteredStoreService) {
    super();
    this.updateTimeMode();
  }

  ngOnInit(): void {
    if (this.dataSubject !== null) this.dataSubject.next(null);
    this.statStore.entities$
      .pipe(
        map((data) => this.format(this.statStore.timeModeSubject.value, data)),
        takeUntil(this.destroy$),
      )
      .subscribe((data) => this.dataSubject.next(data));
  }

  abstract format(apiDateMode: ApiGraphTimeMode, data: StatInterface[]): FormatedStatInterface;

  navChange(timeMode: GraphTimeMode): void {
    this.timeMode = timeMode;

    this.updateTimeMode();
  }

  protected updateTimeMode(): void {
    // month use api group by month other mode use day grouped data
    const apiGraphTimeMode = this.timeMode === GraphTimeMode.Month ? ApiGraphTimeMode.Month : ApiGraphTimeMode.Day;

    //if (apiGraphTimeMode !== this.statStore.timeModeSubject.value) {
    this.statStore.timeModeSubject.next(apiGraphTimeMode);
    //}
  }

  abstract get graphTitle(): string;

  protected updateGraphTitle(): void {
    this.titleUpdate.emit(this.graphTitle);
  }
}
