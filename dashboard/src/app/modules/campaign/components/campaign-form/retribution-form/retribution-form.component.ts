import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { INCENTIVE_UNITS_FR } from '~/core/enums/campaign/incentive-unit.enum';

@Component({
  selector: 'app-retribution-form',
  templateUrl: './retribution-form.component.html',
  styleUrls: ['./retribution-form.component.scss'],
})
export class RetributionFormComponent implements OnInit {
  @Input() campaignForm: FormGroup;
  @Input() forDriver: boolean;
  @Input() forPassenger: boolean;
  @Input() formGroup: FormGroup;
  incentiveUnitFr = INCENTIVE_UNITS_FR;

  constructor() {}

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
