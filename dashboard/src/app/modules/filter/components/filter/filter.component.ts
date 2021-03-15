import { WeekDay } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, AbstractControl, FormControl, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';

import { FilterService } from '~/modules/filter/services/filter.service';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { TRIP_RANKS } from '~/core/enums/trip/trip-rank.enum';
import { TRIP_STATUS_FR, TripStatusEnum } from '~/core/enums/trip/trip-status.enum';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { FilterUxInterface } from '~/core/interfaces/filter/filterUxInterface';
import { dayLabelCapitalized } from '~/core/const/days.const';
import { dateRangeValidator } from '~/modules/filter/validators/date-range.validator';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
  ],
})
export class FilterComponent extends DestroyObservable implements OnInit {
  public filterForm: FormGroup;
  public classes = TRIP_RANKS;
  public tripStatusList = [TripStatusEnum.OK];
  public minDate: string;
  public maxDate = new Date(new Date().getTime() - 86400000); // 1 day ago
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

  constructor(public auth: AuthenticationService, private fb: FormBuilder, private filterService: FilterService) {
    super();
  }

  get controls(): { [key: string]: AbstractControl } {
    return this.filterForm.controls;
  }

  get startControl(): FormControl {
    return this.filterForm.get('date').get('start') as FormControl;
  }

  get endControl(): FormControl {
    return this.filterForm.get('date').get('end') as FormControl;
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

    // date input components
    this.startControl.valueChanges.subscribe(() => {
      this.onDateInput();
    });
    this.endControl.valueChanges.subscribe(() => {
      this.onDateInput();
    });
  }

  public onCloseClick(): void {
    this.hideFiltersPanel();
  }

  public onSubmit(): void {
    const filterObj = this.filterForm.getRawValue();

    if (filterObj.date) {
      if (!filterObj.date.start) delete filterObj.date.start;
      if (!filterObj.date.end) delete filterObj.date.end;
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

  /**
   * Called on each input in either date field
   */
  public onDateInput(): void {
    this.filterForm.updateValueAndValidity();

    const startError = !this.startControl.value ? { required: true } : null;

    if (this.filterForm.hasError('dateRange')) {
      this.startControl.setErrors({
        dateRange: true,
        ...startError,
      });
      this.endControl.setErrors({
        dateRange: true,
      });
    } else {
      this.startControl.setErrors(startError);
      this.endControl.setErrors(null);
    }
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
    const dayMinus1Year = new Date();
    const dayMinus2Year = new Date();

    dayMinus2Year.setMonth(dayMinus2Year.getMonth() - 24);
    dayMinus1Year.setMonth(dayMinus1Year.getMonth() - 12);

    dayMinus1Year.setHours(0, 0, 0, 0);
    dayMinus2Year.setHours(0, 0, 0, 0);

    this.minDate = dayMinus2Year.toISOString();

    this.filterForm = this.fb.group(
      {
        campaignIds: [[]],
        date: this.fb.group({
          start: [dayMinus1Year.toISOString()],
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
      },
      { validator: dateRangeValidator },
    );
  }
}
