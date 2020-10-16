import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, AbstractControl, FormControl, Validators } from '@angular/forms';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { WeekDay } from '@angular/common';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';

import { FilterService } from '~/modules/filter/services/filter.service';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { TRIP_RANKS } from '~/core/enums/trip/trip-rank.enum';
import { TRIP_STATUS_FR, TripStatusEnum } from '~/core/enums/trip/trip-status.enum';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { UserGroupEnum } from '~/core/enums/user/user-group.enum';
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
  animations: [
    trigger('collapse', [
      state(
        'open',
        style({
          'max-height': '1800px',
        }),
      ),
      state(
        'closed',
        style({
          'max-height': '0',
          display: 'none',
        }),
      ),
      transition('open => closed', [style({ 'margin-top': '30px' }), animate('0.3s')]),
      transition('closed => open', [animate('0s')]),
    ]),
  ],
})
export class FilterComponent extends DestroyObservable implements OnInit {
  minDate: string;
  @Input() set showFilter(showFilter: boolean) {
    this._showFilter = showFilter;
  }

  constructor(
    public authService: AuthenticationService,
    private fb: FormBuilder,
    private filterService: FilterService,
  ) {
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

  public get countFilters(): number {
    let count = 0;
    const filter: FilterUxInterface = this.filterForm.value;
    if (filter.operatorIds.length > 0) count += 1;
    if (filter.territoryIds.length > 0) count += 1;
    if (filter.campaignIds.length > 0) count += 1;
    if (filter.days.length > 0) count += 1;
    if (filter.ranks.length > 0) count += 1;
    if (filter.insees.length > 0) count += 1;
    if (filter.distance.min || filter.distance.max) count += 1;
    if (filter.date.start || filter.date.end) count += 1;
    if (filter.hour.start || filter.hour.end) count += 1;
    if (filter.status) count += 1;
    return count;
  }

  public get hasGroupOperatorOrRegistry(): boolean {
    return this.authService.hasAnyGroup([UserGroupEnum.OPERATOR, UserGroupEnum.REGISTRY]);
  }

  public get hasGroupRegistryOrTerritory(): boolean {
    return this.authService.hasAnyGroup([UserGroupEnum.REGISTRY, UserGroupEnum.TERRITORY]);
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
        hour: this.fb.group({
          start: [null, [Validators.min(0), Validators.max(23)]],
          end: [null, [Validators.min(0), Validators.max(23)]],
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
  public filterForm: FormGroup;
  public _showFilter = false;
  public classes = TRIP_RANKS;
  public tripStatusList = [TripStatusEnum.OK];

  public days: WeekDay[] = [1, 2, 3, 4, 5, 6, 0];

  @Output() filterNumber = new EventEmitter();
  @Output() hideFilter = new EventEmitter();

  @ViewChild('townInput') townInput: ElementRef;

  // delegate method
  dayLabel = dayLabelCapitalized;

  ngOnInit(): void {
    this.initForm();

    // reset filter on page trip page load
    this.filterService.filter$.next({});

    this.startControl.valueChanges.subscribe(() => {
      this.onDateInput();
    });
    this.endControl.valueChanges.subscribe(() => {
      this.onDateInput();
    });
  }

  public onCloseClick(): void {
    this.hideFilter.emit();
  }

  public filterClick(): void {
    const filterObj = this.filterForm.getRawValue();

    if (filterObj.date) {
      if (!filterObj.date.start) delete filterObj.date.start;
      if (!filterObj.date.end) delete filterObj.date.end;
    }

    this.filterService.setFilter(filterObj);
    this.filterNumber.emit(this.countFilters);
    this.hideFilter.emit();
  }

  public reinitializeClick(): void {
    // all values to null and reset touch & validation
    this.filterForm.reset();
    // set init values
    this.initForm();
    this.filterNumber.emit(0);
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
}
