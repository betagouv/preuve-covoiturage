import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material';
import { CurrencyPipe, DecimalPipe } from '@angular/common';

import { IncentiveUnitEnum, INCENTIVE_UNITS_FR } from '~/core/enums/campaign/incentive-unit.enum';
import { DestroyObservable } from '~/core/components/destroy-observable';

@Component({
  selector: 'app-parameters-form',
  templateUrl: './parameters-form.component.html',
  styleUrls: ['./parameters-form.component.scss', '../campaign-sub-form.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
  ],
})
export class ParametersFormComponent extends DestroyObservable implements OnInit {
  @Input() campaignForm: FormGroup;
  @Input() isCreating = false;

  minDate = moment().add(1, 'days');
  incentiveUnitKeys = Object.values(IncentiveUnitEnum);
  incentiveUnitFr = INCENTIVE_UNITS_FR;

  constructor(private currencyPipe: CurrencyPipe, private numberPipe: DecimalPipe, private _formBuilder: FormBuilder) {
    super();
  }

  ngOnInit() {
    this.initRetributionFormArray();
    this.initRestrictionFormArray();
    // check that the start date is correct
    if (
      this.campaignForm.get('start').value &&
      moment()
        .add(1, 'days')
        .isAfter(this.campaignForm.get('start').value)
    ) {
      this.campaignForm.controls.start.markAsTouched();
      this.campaignForm.controls.start.updateValueAndValidity();
    }
  }

  get controls() {
    return this.campaignForm.controls;
  }

  get forDriverControl(): FormControl {
    return <FormControl>this.campaignForm.get('ui_status').get('for_driver');
  }

  get forPassengerControl(): FormControl {
    return <FormControl>this.campaignForm.get('ui_status').get('for_passenger');
  }

  get forTripControl(): FormControl {
    return <FormControl>this.campaignForm.get('ui_status').get('for_trip');
  }

  get restrictionFormArray(): FormArray {
    return <FormArray>this.campaignForm.get('restrictions');
  }

  get retributionsFormArray(): FormArray {
    return <FormArray>this.campaignForm.get('retributions');
  }

  showDateLabel(): string {
    const dateBegin = this.controls.start.value;
    const dateEnd = this.controls.end.value;

    if (dateBegin && dateEnd) {
      return `Du ${moment(dateBegin).format('dddd DD MMMM YYYY')} au ${moment(dateEnd).format('dddd DD MMMM YYYY')}`;
    }
    return '';
  }

  showAmountLabel(): string {
    const amount = this.controls.max_amount.value;
    const unit = this.controls.unit.value;
    if (amount && unit) {
      if (unit === IncentiveUnitEnum.EUR) {
        return this.currencyPipe.transform(amount, 'EUR', 'symbol', '1.0-0');
      }
      return `${this.numberPipe.transform(amount, '1.0-0', 'FR')} points`;
    }
  }

  showRestrictionLabel(): string {
    if (this.restrictionFormArray && this.restrictionFormArray.length > 0) {
      const multipleRestrictions = this.restrictionFormArray.length > 1;
      return `${this.restrictionFormArray.length} restriction${multipleRestrictions ? 's' : ''}`;
    }
    return 'Pas de restrictions';
  }

  addRestriction() {
    this.restrictionFormArray.push(this.generateRestrictionFormGroup());
  }

  removeRestriction(idx) {
    this.restrictionFormArray.removeAt(idx);
  }

  isRestrictionFormArrayTouched() {
    for (const control of this.restrictionFormArray.controls) {
      if (!control.valid && control.touched) {
        return true;
      }
    }
    return false;
  }

  onStaggeredChange($event) {
    if (!$event.source._checked) {
      // if staggered mode is unchecked
      this.retributionsFormArray.clear();
      this.retributionsFormArray.push(this.generateRetributionFormGroup());
      //  todo: if no distance is set, don't clear data
    }
  }

  addStaggered() {
    this.retributionsFormArray.push(this.generateRetributionFormGroup());
  }

  removeStaggered(idx) {
    this.retributionsFormArray.removeAt(idx);
  }

  generateRetributionFormGroup(): FormGroup {
    return this._formBuilder.group({
      for_driver: this._formBuilder.group({
        amount: [null],
        per_passenger: [false],
        per_km: [false],
      }),
      for_passenger: this._formBuilder.group({
        free: [false],
        per_km: [false],
        amount: [null],
      }),
      min: [null],
      max: [null],
    });
  }

  generateRestrictionFormGroup(): FormGroup {
    return this._formBuilder.group({
      quantity: [null],
      is_driver: [null],
      period: [null],
    });
  }

  private initRetributionFormArray() {
    if (this.retributionsFormArray.controls.length === 0) {
      this.retributionsFormArray.push(this.generateRetributionFormGroup());
    }
  }

  private initRestrictionFormArray() {
    if (this.restrictionFormArray.controls.length === 0 && this.isCreating) {
      this.restrictionFormArray.push(this.generateRestrictionFormGroup());
    }
  }
}
