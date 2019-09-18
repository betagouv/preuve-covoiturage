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

  get isEuros(): boolean {
    return this.campaignForm.controls.unit.value === IncentiveUnitEnum.EUR;
  }

  private initOnChange() {
    const validators = [Validators.required, Validators.min(0)];
    this.uiStatusControl.valueChanges.subscribe((uiStatus: UiStatusInterface) => {
      // set validators according to differents stats
      if (uiStatus.for_driver && !uiStatus.for_passenger) {
        this.forDriverFormGroup.setValidators(validators);
        this.forPassengerFormGroup.clearValidators();
      }
      if (uiStatus.for_passenger && !uiStatus.for_driver) {
        this.forPassengerFormGroup.setValidators(validators);
        this.forDriverFormGroup.clearValidators();
      }
      if (uiStatus.for_driver && uiStatus.for_passenger) {
        this.forPassengerFormGroup.setValidators(validators);
        this.forDriverFormGroup.setValidators(validators);
      }
      if (uiStatus.for_trip) {
        this.forPassengerFormGroup.setValidators(validators);
        this.forDriverFormGroup.setValidators(validators);
      }
      this.forDriverFormGroup.updateValueAndValidity();
      this.forPassengerFormGroup.updateValueAndValidity();
    });
  }
}
