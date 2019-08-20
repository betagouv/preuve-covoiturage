import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';

import { IncentiveRestriction } from '~/core/entities/campaign/incentive-restriction';

@Component({
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RestrictionFormComponent),
      multi: true,
    },
  ],
  selector: 'app-restriction-form',
  templateUrl: './restriction-form.component.html',
  styleUrls: ['./restriction-form.component.scss'],
})
export class RestrictionFormComponent implements OnInit {
  restrictionForm: FormGroup;

  @Input() timeRange: IncentiveRestriction = new IncentiveRestriction();
  @Input() formControl: FormControl;

  constructor(private _formBuilder: FormBuilder) {}

  ngOnInit() {
    this.restrictionForm = this._formBuilder.group({
      howMuch: [null, [Validators.required, Validators.min(0)]],
      what: [null, Validators.required],
      who: [null, Validators.required],
      when: [null, Validators.required],
    });

    this.restrictionForm.valueChanges.subscribe((value: IncentiveRestriction) => {
      this.onValueChange(value);
    });
  }

  onChange = (value: any) => {};

  writeValue(value: IncentiveRestriction) {
    if (value) {
      this.timeRange = value;
    }
  }

  registerOnChange(fn: (value: any) => void) {
    this.onChange = fn;
  }

  registerOnTouched() {}

  onValueChange(value: IncentiveRestriction) {
    if (this.restrictionForm.valid) {
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
