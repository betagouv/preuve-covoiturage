import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { StatFilteredStoreService } from '~/modules/stat/services/stat-filtered-store.service';
import { ApiGraphTimeMode } from '~/modules/stat/services/ApiGraphTimeMode';
import { GraphTimeMode } from '../GraphTimeMode';
import { StatInterface } from '~/core/interfaces/stat/StatInterface';
import { FormatedStatInterface } from '~/core/interfaces/stat/formatedStatInterface';
import { map, takeUntil, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { StoreLoadingState } from '~/core/services/store/StoreLoadingState';

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
  protected _nextTimeMode = GraphTimeMode.Month;

  protected dataSubject = new BehaviorSubject<FormatedStatInterface>(null);

  protected abstract readonly graphOptions: { [key: string]: any };
  protected abstract readonly graphTypes: { [key: string]: string };
  isLoading$: Observable<Boolean>;

  protected _graphOption: any;
  protected _graphType: string;

  get graphOption() {
    return this._graphOption;
  }

  get graphType() {
    return this._graphType;
  }

  get data$(): Observable<FormatedStatInterface> {
    return this.dataSubject;
  }

  constructor(public statStore: StatFilteredStoreService) {
    super();
    this.updateTimeMode();

    this.isLoading$ = statStore.listLoadingState$.pipe(
      map((state) => state === StoreLoadingState.Debounce || state === StoreLoadingState.LoadStart),
    );
  }

  ngOnInit(): void {
    this._graphOption = this.graphOptions[this.timeMode];
    this._graphType = this.graphTypes[this.timeMode];

    if (this.dataSubject !== null) this.dataSubject.next(null);
    this.statStore.entities$
      .pipe(
        tap((data) => {
          // sync graph config update  when data are updated;
          this.timeMode = this._nextTimeMode;
          this._graphOption = this.graphOptions[this.timeMode];
          this._graphType = this.graphTypes[this.timeMode];
        }),
        map((data) => this.format(this.statStore.timeModeSubject.value, data)),
        takeUntil(this.destroy$),
      )
      .subscribe((data) => this.dataSubject.next(data));
  }

  abstract format(apiDateMode: ApiGraphTimeMode, data: StatInterface[]): FormatedStatInterface;

  navChange(timeMode: GraphTimeMode): void {
    this._nextTimeMode = timeMode;

    this.updateTimeMode();
  }

  protected updateTimeMode(): void {
    const apiGraphTimeMode = this._nextTimeMode === GraphTimeMode.Month ? ApiGraphTimeMode.Month : ApiGraphTimeMode.Day;

    this.statStore.timeModeSubject.next(apiGraphTimeMode);
  }

  abstract get graphTitle(): string;

  protected updateGraphTitle(): void {
    this.titleUpdate.emit(this.graphTitle);
  }
}
