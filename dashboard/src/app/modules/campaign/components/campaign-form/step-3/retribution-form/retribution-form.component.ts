import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { INCENTIVE_UNITS_FR, IncentiveUnitEnum } from '~/core/enums/campaign/incentive-unit.enum';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { UiStatusInterface } from '~/core/interfaces/campaign/ui-status.interface';

@Component({
  selector: 'app-retribution-form',
  templateUrl: './retribution-form.component.html',
  styleUrls: ['./retribution-form.component.scss'],
})
export class RetributionFormComponent extends DestroyObservable implements OnInit {
  @Input() campaignForm: FormGroup;
  @Input() forDriver: boolean;
  @Input() forPassenger: boolean;
  @Input() forTrip = false;
  @Input() formGroup: FormGroup;
  incentiveUnitFr = INCENTIVE_UNITS_FR;

  constructor() {
    super();
  }

  ngOnInit() {
    this.setValidators();
    this.initOnChange();
  }

  get uiStatusControl(): FormControl {
    return <FormControl>this.campaignForm.get('ui_status');
  }

  get campaignFormControls() {
    return this.campaignForm.controls;
  }

  get controls() {
    return this.formGroup.controls;
  }

  get forDriverFormGroup(): FormGroup {
    return <FormGroup>this.formGroup.get('for_driver');
  }

  get forPassengerFormGroup(): FormGroup {
    return <FormGroup>this.formGroup.get('for_passenger');
  }

  get freeControl(): FormControl {
    return <FormControl>this.forPassengerFormGroup.get('free');
  }

  get isEuros(): boolean {
    return this.campaignForm.controls.unit.value === IncentiveUnitEnum.EUR;
  }

  private initOnChange() {
    this.uiStatusControl.valueChanges.subscribe(() => {
      this.setValidators();
    });
    this.freeControl.valueChanges.subscribe(() => {
      this.setValidators();
    });
  }

  private setValidators() {
    const validators = [Validators.required, Validators.min(0)];
    const uiStatus = this.uiStatusControl.value;
    const free = this.freeControl.value;
    const validation = {
      driver: false,
      passenger: false,
    };

    // set validators according to differents stats
    if (uiStatus.for_driver && !uiStatus.for_passenger) {
      validation.driver = true;
      validation.passenger = false;
    }
    if (uiStatus.for_passenger && !uiStatus.for_driver) {
      validation.passenger = true;
      validation.driver = false;
    }
    if ((uiStatus.for_driver && uiStatus.for_passenger) || uiStatus.for_trip) {
      validation.passenger = true;
      validation.driver = true;
    }
    if (free) {
      validation.passenger = false;
    }

    validation.driver
      ? this.forDriverFormGroup.get('amount').setValidators(validators)
      : this.forDriverFormGroup.get('amount').clearValidators();

    validation.passenger
      ? this.forPassengerFormGroup.get('amount').setValidators(validators)
      : this.forPassengerFormGroup.get('amount').clearValidators();

    this.forDriverFormGroup.get('amount').updateValueAndValidity();
    this.forPassengerFormGroup.get('amount').updateValueAndValidity();
  }
}
