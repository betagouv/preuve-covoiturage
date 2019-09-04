import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { JourneyService } from '~/modules/journeys/services/journeyService';
import { AuthenticationService } from '~/applicativeService/authentication/auth.service';
import { MAIN } from '~/config/main';
import { DATES } from '~/config/dates';

import { JOURNEY_HOUR } from '../../config/hour';
import { JOURNEY_FILTER_DAYS } from '../../config/days';
import { JOURNEY_MAIN } from '../../config/main';
import { JOURNEY_DISTANCE } from '../../config/distance';
import { JOURNEY_HEADER } from '../../config/header';

@Component({
  selector: 'app-journeys-filter',
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})
export class JourneyFilterComponent implements OnInit {
  constructor(private authenticationService: AuthenticationService, private journeyService: JourneyService) {
    this.journeyService = journeyService;
  }

  @Input()
  columns;

  dt;
  showMoreFilters;

  @Input()
  set data(val) {
    this.dt = val;
  }

  @Output()
  applyFilters = new EventEmitter();

  minDate = '';
  maxDate = '';

  defaultMinDate: Date;
  defaultMaxDate: Date;

  defaultHourDate: Date;

  minTime = '';
  maxTime = '';

  classes = [];
  operatorIds = [];

  aomIds = [];

  days = JOURNEY_FILTER_DAYS;
  selectedDays = [];

  showDayFilter = JOURNEY_MAIN.showDayFilter;
  showTimeFilter = JOURNEY_MAIN.showTimeFilter;

  distanceMax = JOURNEY_DISTANCE.max;
  distanceRange = [];
  distanceTimeout: any;

  ages = [];

  aomFiltered: any[] = [];
  aomList: any[] = [];

  /*
   * Saved filters before applyed to query
   */
  filters = {};

  fr = DATES.fr;

  ngOnInit(): void {
    this.defaultMinDate = MAIN.startDate;
    this.defaultMaxDate = new Date();
    this.defaultHourDate = new Date(JOURNEY_HOUR.defaultDate);
    this.resetVar();

    this.journeyService.dropdownAom().subscribe((response: any[]) => {
      this.aomList = (response['data'] || []).map((aom) => ({
        value: aom._id._id,
        label: aom._id.name,
      }));
    });
  }

  filterAom(event) {
    this.aomFiltered = this.aomList.filter((i) => new RegExp(event.query, 'i').test(i.label));
  }

  selectAom(selection) {
    if (!selection || !selection.value) return;
    this.addFilter(selection.value, 'aom', 'in');
  }

  onDistanceChange(event) {
    if (this.distanceTimeout) {
      clearTimeout(this.distanceTimeout);
    }

    this.distanceTimeout = setTimeout(
      () => {
        this.addFilter(this.distanceRange, 'passenger.distance', 'gt&lt');
      },
      250, // tslint:disable-line:no-magic-numbers
    );
  }

  onDateChange() {
    let isoMinDate: string;
    let isoMaxDate: string;

    if (this.minDate) {
      isoMinDate = new Date(this.minDate).toISOString();
    }

    if (this.maxDate) {
      isoMaxDate = new Date(this.maxDate).toISOString();
    }

    if (this.minDate && this.maxDate) {
      this.addFilter([isoMinDate, isoMaxDate], 'passenger.start.datetime', 'gt&lt');
    } else if (this.minDate) {
      this.addFilter(isoMinDate, 'passenger.start.datetime', 'gt');
    } else if (this.maxDate) {
      this.addFilter(isoMaxDate, 'passenger.start.datetime', 'lt');
    }
  }

  /**
   * todo: Not active yet
   */
  onTimeChange() {
    const isoMinTime = new Date(this.minTime).getHours();
    const isoMaxTime = new Date(this.maxTime).getHours();

    if (this.minTime && this.maxTime) {
      this.addFilter([isoMinTime, isoMaxTime], 'time', 'gt&lt');
    } else if (this.minTime) {
      this.addFilter(isoMinTime, 'time', 'gt');
    } else if (this.maxTime) {
      this.addFilter(isoMaxTime, 'time', 'lt');
    }
  }

  /**
   * todo: Not active yet
   */
  onDayChange() {
    this.addFilter(this.selectedDays, 'day', 'in');
  }

  filterText(event, colName) {
    const colIndex = this.getColumnIndexFromName(colName);
    this.addFilter(event.target.value, this.columns[colIndex].field, this.columns[colIndex].filterMatchMode);
  }

  onClassChange() {
    this.addFilter(this.classes, 'operator_class', 'in');
  }

  onOperatorChange(operatorIds) {
    this.operatorIds = operatorIds;
    this.addFilter(this.operatorIds, 'operator._id', 'in');
  }

  onAomChange(aomIds) {
    this.aomIds = aomIds;
    this.addFilter(this.aomIds, 'aom._id', 'in');
  }

  onAgeChange() {
    const allAges = ['true', 'false'];
    if (this.ages.indexOf('nc') !== -1) {
      if (this.ages.indexOf('true') !== -1 && this.ages.indexOf('false') !== -1) {
        this.addFilter(allAges, 'passenger.identity.over_18', 'in');
      } else if (this.ages.indexOf('true') !== -1) {
        this.addFilter(['false'], 'passenger.identity.over_18', 'nin');
      } else if (this.ages.indexOf('false') !== -1) {
        this.addFilter(['true'], 'passenger.identity.over_18', 'nin');
      } else {
        this.addFilter(allAges, 'passenger.identity.over_18', 'nin');
      }
    } else {
      this.addFilter(this.ages, 'passenger.identity.over_18', 'in');
    }
  }

  addFilter(value, colName, filterType) {
    this.filters[colName] = {
      colName,
      value,
      filterType,
    };
  }

  hasAnyGroup(groups: string[]) {
    return !!this.authenticationService.hasAnyGroup(groups);
  }

  apply() {
    this.applyFilters.emit(this.filters);
  }

  reset() {
    this.filters = {};
    this.resetVar();
    this.dt.reset();
    this.applyFilters.emit();
  }

  resetVar() {
    this.distanceRange = [0, JOURNEY_DISTANCE.max];
    this.selectedDays = this.days.map((value) => value.value);
    this.minDate = '';
    this.maxDate = '';
    this.minTime = '';
    this.maxTime = '';
    this.classes = [];
    this.operatorIds = [];
    this.aomIds = [];
    this.ages = [];
  }

  getColumnIndexFromName(colName) {
    return JOURNEY_HEADER.main.journey.indexOf(colName);
  }
}
