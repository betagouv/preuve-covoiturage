import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DestroyObservable } from '~/core/components/destroy-observable';

@Component({
  selector: 'app-staggered-form',
  templateUrl: './staggered-form.component.html',
  styleUrls: ['./staggered-form.component.scss'],
})
export class StaggeredFormComponent extends DestroyObservable implements OnInit {
  @Input() isFirst: boolean;
  @Input() formGroup: FormGroup;

  _isLast: boolean;
  get isLast(): boolean {
    return this._isLast;
  }

  @Input('isLast') set isLast(value: boolean) {
    this._isLast = value;
    this.initForm();
  }

  _previousFormGroup: FormGroup;
  get previousFormGroup(): FormGroup {
    return this._previousFormGroup;
  }

  @Input('previousFormGroup')
  set previousFormGroup(value: FormGroup) {
    this._previousFormGroup = value;
    if (this.previousSubscription) {
      this.previousSubscription.unsubscribe();
      this.initForm();
      this.subscribeToPreviousFormValue();
    }
  }

  previousSubscription: Subscription;

  constructor() {
    super();
  }

  ngOnInit() {
    this.subscribeToPreviousFormValue();
  }

  get controls() {
    return this.formGroup.controls;
  }

  initForm() {
    this.controls.min.setValidators(Validators.required);
    this.controls.max.setValidators(Validators.required);
    this.controls.max.enable();
    if (this.isFirst) {
      this.controls.max.setValidators([Validators.required, Validators.min(1)]);
      this.controls.min.setValue(0);
    }
    if (this.isLast) {
      this.controls.max.disable();
    }
  }

  subscribeToPreviousFormValue() {
    if (!this.previousFormGroup) {
      return;
    }
    this.onPreviousValueChange();
    this.previousSubscription = this.previousFormGroup.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.onPreviousValueChange();
    });
  }

  onPreviousValueChange() {
    const value = this.previousFormGroup.value;
    if (value.max) {
      const previousMax = Number(value.max);
      this.controls.min.setValue(previousMax);

      if (!this.isLast) {
        this.controls.max.setValidators([Validators.required, Validators.min(previousMax + 1)]);
        this.controls.max.updateValueAndValidity();
      }
    } else {
      this.controls.min.setValue(null);
    }
  }
}
