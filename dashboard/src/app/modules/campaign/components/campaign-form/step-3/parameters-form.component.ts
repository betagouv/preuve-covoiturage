import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, AbstractControl } from '@angular/forms';
import * as moment from 'moment';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material';
import { CurrencyPipe, DecimalPipe } from '@angular/common';

import { IncentiveUnitEnum, INCENTIVE_UNITS_FR } from '~/core/enums/campaign/incentive-unit.enum';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { uniqueRetributionValidator } from '~/modules/campaign/validators/retribution-unique.validator';
import { CampaignUiService } from '~/modules/campaign/services/campaign-ui.service';

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
  // @Input() displayOperatorFilters = false;

  minDate = moment().add(1, 'days');
  incentiveUnitKeys = Object.values(IncentiveUnitEnum);
  incentiveUnitFr = INCENTIVE_UNITS_FR;
  editRestrictionForm: FormGroup;

  constructor(
    private currencyPipe: CurrencyPipe,
    private numberPipe: DecimalPipe,
    private _formBuilder: FormBuilder,
    public campaignUI: CampaignUiService,
  ) {
    super();
  }

  ngOnInit(): void {
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

  get controls(): { [key: string]: AbstractControl } {
    return this.campaignForm.controls;
  }

  get forDriverControl(): FormControl {
    return this.campaignForm.get('ui_status').get('for_driver') as FormControl;
  }

  get forPassengerControl(): FormControl {
    return this.campaignForm.get('ui_status').get('for_passenger') as FormControl;
  }

  get forTripControl(): FormControl {
    return this.campaignForm.get('ui_status').get('for_trip') as FormControl;
  }

  get restrictionFormArray(): FormArray {
    return this.campaignForm.get('restrictions') as FormArray;
  }

  get retributionsFormArray(): FormArray {
    return this.campaignForm.get('retributions') as FormArray;
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

  startEditRestriction(): void {
    this.editRestrictionForm = this.generateRestrictionFormGroup();
  }

  cancelEditRestriction(): void {
    delete this.editRestrictionForm;
  }

  addRestriction(): void {
    this.restrictionFormArray.push(this.editRestrictionForm);
    delete this.editRestrictionForm;
  }

  removeRestriction(idx): void {
    this.restrictionFormArray.removeAt(idx);
  }

  isRestrictionFormArrayTouched(): boolean {
    for (const control of this.restrictionFormArray.controls) {
      if (!control.valid && control.touched) {
        return true;
      }
    }
    return false;
  }

  onStaggeredChange($event): void {
    if (!$event.source._checked) {
      // if staggered mode is unchecked
      this.retributionsFormArray.clear();
      this.retributionsFormArray.push(this.generateRetributionFormGroup());
      //  todo: if no distance is set, don't clear data
    }
  }

  addStaggered(): void {
    this.retributionsFormArray.push(this.generateRetributionFormGroup());
  }

  removeStaggered(idx): void {
    this.retributionsFormArray.removeAt(idx);
  }

  generateRetributionFormGroup(): FormGroup {
    return this._formBuilder.group(
      {
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
      },
      // { validators: [uniqueRetributionValidator] },
    );
  }

  generateRestrictionFormGroup(): FormGroup {
    return this._formBuilder.group({
      quantity: [null],
      is_driver: [null],
      period: [null],
      unit: [null],
    });
  }

  private initRetributionFormArray(): void {
    if (this.retributionsFormArray.controls.length === 0) {
      this.retributionsFormArray.push(this.generateRetributionFormGroup());
    }
  }

  private initRestrictionFormArray(): void {
    if (this.restrictionFormArray.controls.length === 0 && this.isCreating) {
      this.restrictionFormArray.push(this.generateRestrictionFormGroup());
    }
  }
}
