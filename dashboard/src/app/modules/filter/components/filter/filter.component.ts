import { WeekDay } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

import { DestroyObservable } from '~/core/components/destroy-observable';
import { dayLabelCapitalized } from '~/core/const/days.const';
import { TRIP_RANKS } from '~/core/enums/trip/trip-rank.enum';
import { TripStatusEnum, TRIP_STATUS_FR } from '~/core/enums/trip/trip-status.enum';
import { FilterUxInterface } from '~/core/interfaces/filter/filterUxInterface';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { FilterService } from '~/modules/filter/services/filter.service';
import { TerritoryCodeEnum } from '~/shared/territory/common/interfaces/TerritoryCodeInterface';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    {
      provide: MAT_DATE_FORMATS,
      useValue: {
        parse: {
          dateInput: ['l', 'LL'],
        },
        display: {
          dateInput: 'L',
          monthYearLabel: 'MMM YYYY',
          dateA11yLabel: 'LL',
          monthYearA11yLabel: 'MMMM YYYY',
        },
      },
    },
  ],
})
export class FilterComponent extends DestroyObservable implements OnInit {
  public filterForm: FormGroup;
  public classes = TRIP_RANKS;
  public tripStatusList = [TripStatusEnum.OK];
  public minDate = new Date(new Date().getTime() - 31556952000 * 2); // 2 years ago;
  public maxDate = new Date(new Date().getTime() - 86400000 * 5); // 5 days ago
  public userIsTerritory: boolean;

  public days: WeekDay[] = [1, 2, 3, 4, 5, 6, 0];

  // delay HTTP call to let the panel close without a glitch
  // closing animation duration is 200ms
  // ❤️ mono-threaded JS !
  private closingAnimationTimeout = 200;

  @Input() showFilters: boolean;
  @Output() showFiltersChange = new EventEmitter<boolean>();
  @Output() filtersCount = new EventEmitter();
  @ViewChild('townInput') townInput: ElementRef;

  constructor(
    public auth: AuthenticationService,
    private fb: FormBuilder,
    private filterService: FilterService,
  ) {
    super();
  }

  get controls(): { [key: string]: AbstractControl } {
    return this.filterForm.controls;
  }

  get startControl(): FormControl {
    return this.filterForm.get('date.start') as FormControl;
  }

  get endControl(): FormControl {
    return this.filterForm.get('date.end') as FormControl;
  }

  // delegate method
  dayLabel = dayLabelCapitalized;

  ngOnInit(): void {
    this.initForm();

    this.userIsTerritory = this.auth.isTerritory();

    // reset filter on page trip page load
    this.filterService.resetFilter();
    this.filterService.filter$.subscribe((filters) => {
      if (!this.countFilters(filters)) this.initForm();
      this.filtersCount.emit(this.countFilters(filters));
      this.hideFiltersPanel();
    });
  }

  public onCloseClick(): void {
    this.hideFiltersPanel();
  }

  public onSubmit(): void {
    const filterObj: FilterUxInterface = this.filterForm.getRawValue();

    if (filterObj.date) {
      if (!filterObj.date.start) delete filterObj.date.start;
      if (!filterObj.date.end) delete filterObj.date.end;
    }

    if (filterObj?.territoryIds.length) {
      filterObj.geo_selector = {
        com: filterObj.territoryIds.filter((t) => t.type == TerritoryCodeEnum.City).map((t) => t.insee),
        arr: filterObj.territoryIds.filter((t) => t.type == TerritoryCodeEnum.Arr).map((t) => t.insee),
        reg: filterObj.territoryIds.filter((t) => t.type == TerritoryCodeEnum.Region).map((t) => t.insee),
        aom: filterObj.territoryIds.filter((t) => t.type == TerritoryCodeEnum.Mobility).map((t) => t.insee),
        epci: filterObj.territoryIds.filter((t) => t.type == TerritoryCodeEnum.CityGroup).map((t) => t.insee),
      };
    }

    setTimeout(() => {
      this.filterService.setFilter(filterObj);
    }, this.closingAnimationTimeout);
  }

  /**
   * Reset filters and apply the value
   */
  public onReset(): void {
    setTimeout(() => {
      this.filterService.resetFilter();
    }, this.closingAnimationTimeout);
  }

  public getStatusFrench(status: TripStatusEnum): string {
    return TRIP_STATUS_FR[status];
  }

  public countFilters(f: FilterUxInterface | {} = {}): number {
    if (f && JSON.stringify(f) === '{}') {
      return 0;
    }

    let count = 0;
    const filter = f || this.filterForm.value;

    if ('operatorIds' in filter && filter.operatorIds.length > 0) count += 1;
    if ('territoryIds' in filter && filter.territoryIds.length > 0) count += 1;
    if ('campaignIds' in filter && filter.campaignIds.length > 0) count += 1;
    if ('days' in filter && filter.days.length > 0) count += 1;
    if ('ranks' in filter && filter.ranks.length > 0) count += 1;
    if ('insees' in filter && filter.insees.length > 0) count += 1;
    if ('distance' in filter && (filter.distance.min || filter.distance.max)) count += 1;
    if (('date' in filter && filter.date.start) || filter.date.end) count += 1;
    if ('status' in filter && filter.status) count += 1;

    return count;
  }

  private hideFiltersPanel(): void {
    this.showFiltersChange.emit(false);
  }

  private initForm(): void {
    // init date picker value and limits in the past
    const dayMinus1Year = new Date(new Date().setMonth(new Date().getMonth() - 12));
    const dayMinus2Year = new Date(new Date().setMonth(new Date().getMonth() - 24));
    const dayMinus5Days = new Date(new Date().setDate(new Date().getDate() - 5));

    dayMinus1Year.setHours(0, 0, 0, 0);
    dayMinus2Year.setHours(0, 0, 0, 0);
    dayMinus5Days.setHours(0, 0, 0, 0);

    // init the form values
    this.filterForm = this.fb.group({
      campaignIds: [[]],
      date: this.fb.group({
        start: [dayMinus1Year],
        end: [null],
      }),
      days: [[]],
      insees: [[]],
      distance: this.fb.group({
        min: [null, [Validators.min(0), Validators.max(150)]],
        max: [null, [Validators.min(0), Validators.max(150)]],
      }),
      ranks: [[]],
      status: [null],
      operatorIds: [[]],
      territoryIds: [[]],
    });
  }
}
