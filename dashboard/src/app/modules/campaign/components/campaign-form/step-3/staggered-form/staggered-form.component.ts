import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, Validators, AbstractControl } from '@angular/forms';
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
  @Input() campaignForm: FormGroup;
  @Input() formGroup: FormGroup;

  minValue = 0;

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

  ngOnInit(): void {
    this.subscribeToPreviousFormValue();
  }

  get controls(): { [key: string]: AbstractControl } {
    return this.formGroup.controls;
  }

  get globalMinDistance(): number {
    return this.campaignForm.get('filters').get('distance_range').value[0];
  }

  get globalMaxDistance(): number {
    return this.campaignForm.get('filters').get('distance_range').value[1];
  }

  initForm(): void {
    this.controls.min.setValidators(Validators.required);
    this.controls.max.setValidators(Validators.required);
    this.controls.max.enable();
    if (this.isFirst) {
      const min = this.globalMinDistance;
      this.minValue = min;
      const max = this.globalMaxDistance;
      this.controls.max.setValidators([Validators.required, Validators.min(min + 1), Validators.max(max)]);
      this.controls.min.setValue(min);
    }
    if (this.isLast) {
      this.controls.max.disable();
    }
  }

  subscribeToPreviousFormValue(): void {
    if (!this.previousFormGroup) {
      return;
    }
    this.onPreviousValueChange();
    this.previousSubscription = this.previousFormGroup.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.onPreviousValueChange();
    });
  }

  onPreviousValueChange(): void {
    const value = this.previousFormGroup.value;
    if (value.max) {
      const previousMax = Number(value.max);
      this.controls.min.setValue(previousMax);

      if (!this.isLast) {
        const max = this.globalMaxDistance;
        this.minValue = previousMax + 1;
        this.controls.max.setValidators([Validators.required, Validators.min(previousMax + 1), Validators.max(max)]);
        this.controls.max.updateValueAndValidity();
      }
    } else {
      this.controls.min.setValue(null);
    }
  }
}
