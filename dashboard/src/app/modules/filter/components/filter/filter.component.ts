import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { animate, state, style, transition, trigger } from '@angular/animations';
import * as moment from 'moment';
import { WeekDay } from '@angular/common';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';

import { FilterService } from '~/core/services/filter.service';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { TRIP_RANKS } from '~/core/enums/trip/trip-rank.enum';
import { TRIP_STATUS, TRIP_STATUS_FR, TripStatusEnum } from '~/core/enums/trip/trip-status.enum';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { TownInterface } from '~/core/interfaces/geography/townInterface';

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
  public filterForm: FormGroup;
  public _showFilter = false;
  public classes = TRIP_RANKS;
  public tripStatusList = TRIP_STATUS;

  public days: WeekDay[] = [0, 1, 2, 3, 4, 5, 6];

  @Input() set showFilter(showFilter: boolean) {
    this._showFilter = showFilter;
  }

  @Output() filterNumber = new EventEmitter();
  @Output() hideFilter = new EventEmitter();

  @ViewChild('townInput', { static: false }) townInput: ElementRef;

  constructor(
    public authService: AuthenticationService,
    private fb: FormBuilder,
    private filterService: FilterService,
  ) {
    super();
  }

  ngOnInit() {
    this.filterForm = this.fb.group({
      campaignIds: [[]],
      date: this.fb.group({
        start: [null],
        end: [null],
      }),
      hour: this.fb.group({
        start: [null],
        end: [null],
      }),
      days: [[]],
      towns: [[]],
      distance: this.fb.group({
        min: [null],
        max: [null],
      }),
      ranks: [[]],
      status: [null],
      operatorIds: [[]],
      territoryIds: [[]],
    });
  }

  get controls() {
    return this.filterForm.controls;
  }

  public onCloseClick(): void {
    this.hideFilter.emit();
  }

  public filterClick(): void {
    const filterObj = this.filterForm.value;

    // format for API
    filterObj.towns = this.filterForm.value.towns.map((town: TownInterface) => town.name);

    this.filterService.setFilter(filterObj);
    this.filterNumber.emit(this.countFilters);
    this.hideFilter.emit();
  }

  public reinitializeClick(): void {
    this.filterForm.reset();
    this.filterNumber.emit(0);
  }

  public get countFilters(): number {
    return Object.values(this.filterForm.value).filter((val) => !!val).length;
  }

  public getStatusFrench(status: TripStatusEnum) {
    return TRIP_STATUS_FR[status];
  }

  public getDaysFrench(day: WeekDay) {
    return moment()
      .isoWeekday(day + 1)
      .format('dddd');
  }
}
