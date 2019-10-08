import { Component, forwardRef, Input, OnInit } from '@angular/core';
import {
  ControlValueAccessor,
  FormBuilder,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
  Validators,
} from '@angular/forms';

import { IncentiveTimeRuleUxInterface } from '~/core/entities/campaign/ux-format/incentive-filters';

@Component({
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RangeTimePickerComponent),
      multi: true,
    },
  ],
  selector: 'app-range-time-picker',
  templateUrl: './range-time-picker.component.html',
  styleUrls: ['./range-time-picker.component.scss'],
})
export class RangeTimePickerComponent implements OnInit, ControlValueAccessor {
  timeRangeForm: FormGroup;

  @Input() timeRange: IncentiveTimeRuleUxInterface = { start: null, end: null };
  @Input() formControl: FormControl;

  constructor(private _formBuilder: FormBuilder) {}

  ngOnInit() {
    this.timeRangeForm = this._formBuilder.group({
      start: [this.timeRange ? this.timeRange.start : null, Validators.required],
      end: [this.timeRange ? this.timeRange.end : null, Validators.required],
    });

    this.timeRangeForm.valueChanges.subscribe((value: IncentiveTimeRuleUxInterface) => {
      this.onValueChange(value);
    });
  }

  get controls() {
    return this.timeRangeForm.controls;
  }

  onChange = (value: any) => {};

  writeValue(value: IncentiveTimeRuleUxInterface) {
    if (value) {
      this.timeRange = value;
    }
  }

  registerOnChange(fn: (value: any) => void) {
    this.onChange = fn;
  }

  registerOnTouched() {}

  onValueChange(value: IncentiveTimeRuleUxInterface) {
    if (value.start && value.end) {
      const beginDate = new Date();
      beginDate.setHours(Number(value.start.split(':')[0]), Number(value.start.split(':')[1]), 0, 0);
      const endDate = new Date();
      endDate.setHours(Number(value.end.split(':')[0]), Number(value.end.split(':')[1]), 0, 0);
      if (beginDate.getTime() >= endDate.getTime()) {
        this.controls.start.setErrors(['max']);
        this.controls.end.setErrors(['min']);
      } else {
        this.controls.start.setErrors(null);
        this.controls.end.setErrors(null);
      }
    }
    if (this.timeRangeForm.valid) {
      this.writeValue(value);
      this.onChange(value);
    } else {
      this.writeValue(null);
      this.onChange(null);
    }
  }

  onTouched() {
    if (this.formControl) {
      this.formControl.markAsTouched();
    }
  }
}
