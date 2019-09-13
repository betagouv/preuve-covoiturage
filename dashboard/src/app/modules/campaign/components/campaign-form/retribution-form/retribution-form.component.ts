import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { INCENTIVE_UNITS_FR, IncentiveUnitEnum } from '~/core/enums/campaign/incentive-unit.enum';
import { DestroyObservable } from '~/core/components/destroy-observable';

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

  ngOnInit() {}

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
}
