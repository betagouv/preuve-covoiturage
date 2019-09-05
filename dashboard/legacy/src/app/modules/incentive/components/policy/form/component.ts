import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { DialogService } from 'primeng/api';

import { DIALOGSTYLE } from '~/config/dialog/dialogStyle';

import { IncentivePolicyConfirmationComponent } from '../confirmation/component';

@Component({
  selector: 'app-incentive-policy-general-form',
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})
export class IncentivePolicyGeneralFormComponent {
  @Input() policyForm: FormGroup;
  @Input() policyNameForm: FormControl;
  @Input() policyDescriptionForm: FormControl;
  @Output() submit = new EventEmitter();

  constructor(private dialogService: DialogService) {}

  onSubmit() {
    if (this.policyNameForm.value) {
      const config = {
        ...DIALOGSTYLE,
        header: "Confirmer la création d'une nouvelle politique",
        data: {
          policy: this.policyForm.value,
        },
      };

      const ref = this.dialogService.open(IncentivePolicyConfirmationComponent, config);

      ref.onClose.subscribe((confirm: boolean) => {
        this.submit.emit(confirm);
      });
    }
  }
}
