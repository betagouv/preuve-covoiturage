import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-staggered-form',
  templateUrl: './staggered-form.component.html',
  styleUrls: ['./staggered-form.component.scss'],
})
export class StaggeredFormComponent implements OnInit {
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

  constructor() {}

  ngOnInit() {
    this.subscribeToPreviousFormValue();
  }

  get controls() {
    return this.formGroup.controls;
  }

  initForm() {
    this.controls.start.setValidators(Validators.required);
    this.controls.end.setValidators(Validators.required);
    this.controls.end.enable();
    if (this.isFirst) {
      this.controls.end.setValidators([Validators.required, Validators.min(1)]);
      this.controls.start.setValue(0);
    }
    if (this.isLast) {
      this.controls.end.disable();
    }
  }

  subscribeToPreviousFormValue() {
    if (!this.previousFormGroup) {
      return;
    }
    this.onPreviousValueChange();
    this.previousSubscription = this.previousFormGroup.valueChanges.subscribe(() => {
      this.onPreviousValueChange();
    });
  }

  onPreviousValueChange() {
    const value = this.previousFormGroup.value;
    if (value.end) {
      const previousEnd = Number(value.end);
      this.controls.start.setValue(previousEnd);

      if (!this.isLast) {
        this.controls.end.setValidators([Validators.required, Validators.min(previousEnd + 1)]);
        this.controls.end.updateValueAndValidity();
      }
    } else {
      this.controls.start.setValue(null);
    }
  }
}
