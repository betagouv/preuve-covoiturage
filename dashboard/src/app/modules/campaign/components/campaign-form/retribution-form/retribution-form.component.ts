import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Campaign } from '~/core/entities/campaign/campaign';
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
  getIncentiveUnitLabel = Campaign.getIncentiveUnitLabel;

  constructor() {
    super();
  }

  ngOnInit() {}

  get campaignFormControls() {
    return this.campaignForm.controls;
  }

  get retributionParametersForm(): FormGroup {
    return <FormGroup>this.campaignForm.get('retributionParameters');
  }

  get controls() {
    return this.formGroup.controls;
  }
}
