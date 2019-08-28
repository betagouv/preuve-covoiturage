import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { animate, state, style, transition, trigger } from '@angular/animations';
import * as moment from 'moment';
import { WeekDay } from '@angular/common';

import { FilterService } from '~/core/services/filter.service';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { CLASSES } from '~/core/const/classes.const';
import { TRIP_STATUS, TRIP_STATUS_FR } from '~/core/const/trip/tripStatus.const';
import { TripStatusType } from '~/core/types/trip/statusType';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
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
export class FilterComponent implements OnInit {
  public filterForm: FormGroup;
  public _showFilter = false;
  public classes = CLASSES;
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
  ) {}

  ngOnInit() {
    this.filterForm = this.fb.group({
      campaign: [null],
      startDate: [null],
      endDate: [null],
      startTime: [null],
      endTime: [null],
      days: [null],
      towns: [null],
      minDistance: [null],
      maxDistance: [null],
      classes: [null],
      status: [null],
      operators: [null],
      territories: [null],
    });
  }

  public onCloseClick(): void {
    this.hideFilter.emit();
  }

  public filterClick(): void {
    this.filterService.setFilter(this.filterForm.value);
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

  public getStatusFrench(status: TripStatusType) {
    return TRIP_STATUS_FR[status];
  }

  public getDaysFrench(day: WeekDay) {
    return moment()
      .isoWeekday(day + 1)
      .format('dddd');
  }
}
