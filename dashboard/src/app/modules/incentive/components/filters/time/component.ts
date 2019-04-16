import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormArray, FormGroup } from '@angular/forms';

import { Calendar } from 'primeng/calendar';

import {
  DynamicDialogRef,
  DynamicDialogConfig,
} from 'primeng/api';

import { TimeFilter } from '~/modules/incentive/filters/TimeFilter';

@Component({
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})

export class IncentiveTimeFilterComponent implements OnInit {
  public filter: typeof TimeFilter;


  public filterForm = this.fb.group({
    value: this.fb.array([]),
  });

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    public fb: FormBuilder,
  ) {
  }

  get ranges() {
    return this.filterForm.get('value') as FormArray; // tslint:disable-line
  }

  ngOnInit(): void {
    this.filter = this.config.data.filter;

    console.log('filter', this.filter);

    if (this.config.data && 'value' in this.config.data) {
      const value = this.config.data.value;
      if (value.length > 0) {
        value.forEach((v, i) => {
          this.ranges.push(this.createRange());
          this.ranges.at(i).patchValue(v);
        });
      }
    }
  }

  createRange() {
    // console.log(this.filter)
    const { defaultMin, defaultMax } = this.filter.config;

    const start = new Date();
    start.setHours(...defaultMin);

    const end = new Date();
    end.setHours(...defaultMax);

    return this.fb.group(
      {
        start: [start, Validators.required],
        end: [end, Validators.required],
      },
      {
        validator: this.dateLessThan('start', 'end'),
      },
    );
  }

  dateLessThan(start: string, end: string) {
    return (group: FormGroup): { [key: string]: any } => {
      const f = group.controls[start];
      const t = group.controls[end];
      if (f.value > t.value) {
        return {
          dates: 'Date from should be less than Date to',
        };
      }
      return {};
    };
  }

  get minDateValue() {
    const date = new Date();
    date.setHours(...this.filter.config.min);
    return date;
  }

  get maxDateValue() {
    const date = new Date();
    date.setHours(...this.filter.config.max);
    return date;
  }

  updateCalendarUI(id: number, type: string, calendar: Calendar) {
    const value = this.ranges.at(id).value;
    switch (type) {
      case 'min':
        calendar.maxDate = value.end || this.maxDateValue;
        break;
      case 'max':
        calendar.minDate = value.start || this.minDateValue;
        break;
      default:
        break;
    }
    calendar.updateUI();
  }

  addRange(event) {
    this.ranges.push(this.createRange());
    event.preventDefault();
  }

  deleteRange(i) {
    this.ranges.removeAt(i);
  }

  onSubmit() {
    this.ref.close(this.filter.export(this.filterForm.value.value));
  }
}
