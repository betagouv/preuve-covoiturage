import { Component } from '@angular/core';
import { FormBuilder, Validators, FormArray, FormGroup } from '@angular/forms';
import { DialogService } from 'primeng/api';
import { Router } from '@angular/router';

import { IncentivePolicy } from '~/entities/database/Incentive/incentivePolicy';
import { IncentiveParameterValue } from '~/entities/database/Incentive/incentiveParameterValue';
import { DIALOGSTYLE } from '~/config/dialog/dialogStyle';
import { IncentiveCampaignConfirmationComponent } from '~/modules/incentive/components/campaign/confirmation/component';
import { ApiResponse } from '~/entities/responses/apiResponse';
import { ModalResponse } from '~/entities/responses/modalResponse';

import { IncentiveCampaignService } from '../../../services/incentiveCampaignService';
import { IncentivePolicyPanelComponent } from '../../../components/policy/panel/component';
import { IncentivePolicyPickerComponent } from '../../../components/policy/picker/component';

@Component({
  templateUrl: './template.html',
  styleUrls: ['style.scss'],
})
export class IncentiveCampaignsCreatePageComponent {
  public campaignForm = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    start: ['', Validators.required],
    end: ['', Validators.required],
    policies: [[], Validators.required],
  });
  public loading = false;

  public campaignRange = this.fb.control('');

  constructor(
    private fb: FormBuilder,
    private incentiveCampaignService: IncentiveCampaignService,
    private dialogService: DialogService,
    private router: Router,
  ) {
    //
  }

  get calendarLocale() {
    return {
      firstDayOfWeek: 1,
      dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
      dayNamesShort: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
      dayNamesMin: ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'],
      monthNames: [
        'Janvier',
        'Février',
        'Mars',
        'Avril',
        'Mai',
        'Juin',
        'Juillet',
        'Août',
        'Septembre',
        'Octobre',
        'Novembre',
        'Decembre',
      ],
      monthNamesShort: ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Dec'],
      today: "Aujourd'hui",
      clear: 'Remise à zéro',
      dateFormat: 'dd/mm/yy',
    };
  }

  get policies() {
    return this.campaignForm.get('policies') as FormArray; // tslint:disable-line
  }

  get minDate() {
    return new Date();
  }

  get appliedPolicies() {
    return this.campaignForm.value.policies;
  }

  rangeSelected(e) {
    if (this.campaignRange.value.filter((d) => d === null).length === 0) {
      const [start, end] = this.campaignRange.value;
      this.campaignForm.patchValue({
        start,
        end,
      });
    }
  }

  addPolicy() {
    const config = {
      ...DIALOGSTYLE,
      header: 'Ajouter une politique',
    };

    const ref = this.dialogService.open(IncentivePolicyPickerComponent, config);

    ref.onClose.subscribe((policy: IncentivePolicy) => {
      if (policy) {
        policy.parameters = policy.parameters.filter((value) => !value.internal);
        this.startEditModal(
          {
            policy,
            header: 'Configurer la nouvelle politique',
            parameters: [],
          },
          (parameters) => {
            const appliedPolicies = this.campaignForm.value.policies;
            this.campaignForm.patchValue({
              policies: [
                ...appliedPolicies,
                {
                  parameters,
                  policy,
                },
              ],
            });
          },
        );
      }
    });
  }

  editPolicy(i) {
    const { policy, parameters } = this.appliedPolicies[i];
    this.startEditModal(
      {
        policy,
        parameters,
        header: 'Éditer la politique',
      },
      (newParameters) => {
        const appliedPolicies = [...this.campaignForm.value.policies];

        appliedPolicies[i] = {
          policy,
          parameters: newParameters,
        };

        this.campaignForm.patchValue({
          policies: appliedPolicies,
        });
      },
    );
  }

  private startEditModal({ header, policy, parameters }, callback: Function) {
    const config = {
      ...DIALOGSTYLE,
      header,
      data: {
        policy,
        parameters,
      },
    };

    const ref = this.dialogService.open(IncentivePolicyPanelComponent, config);

    ref.onClose.subscribe((newParameters: [IncentiveParameterValue]) => {
      if (newParameters) {
        callback(newParameters);
      }
    });
  }
  moveUpPolicy(i) {
    if (i > 0) {
      const appliedPolicies = this.appliedPolicies;

      appliedPolicies.splice(i - 1, 0, appliedPolicies.splice(i, 1)[0]);

      this.campaignForm.patchValue({
        policies: appliedPolicies,
      });
    }
  }

  moveDownPolicy(i) {
    const appliedPolicies = this.appliedPolicies;

    if (i < appliedPolicies.length) {
      appliedPolicies.splice(i + 1, 0, appliedPolicies.splice(i, 1)[0]);

      this.campaignForm.patchValue({
        policies: appliedPolicies,
      });
    }
  }

  deletePolicy(i) {
    const appliedPolicies = this.appliedPolicies;

    appliedPolicies.splice(i, 1);

    this.campaignForm.patchValue({
      policies: appliedPolicies,
    });
  }

  onSubmit() {
    const config = {
      ...DIALOGSTYLE,
      header: 'Confirmer le lancement de la nouvelle campagne',
      data: {
        campaign: this.campaignForm.value,
      },
    };

    const ref = this.dialogService.open(IncentiveCampaignConfirmationComponent, config);

    ref.onClose.subscribe((answer: ModalResponse) => {
      if (answer.confirm) {
        this.postCampaign();
      }
    });
  }

  postCampaign() {
    const campaign = this.campaignForm.value;
    const normalizedPolicies = campaign.policies.map((campaignPolicy) => {
      const { policy, parameters } = campaignPolicy;
      return {
        parameters,
        policy: policy._id,
      };
    });
    this.loading = true;
    this.incentiveCampaignService
      .post({
        ...campaign,
        start: campaign.start.toISOString(),
        end: campaign.end.toISOString(),
        policies: normalizedPolicies,
      })
      .subscribe(
        (response) => {
          this.loading = false;
          this.reset();
          this.router.navigate(['/dashboard/incentives/campaigns']);
        },
        () => {
          this.loading = false;
        },
      );
  }

  reset() {
    this.campaignForm.reset();
    this.campaignRange.reset();
  }
}
