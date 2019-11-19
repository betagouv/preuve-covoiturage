import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';

import { UtilsService } from '~/core/services/utils.service';
import { IncentiveUnitEnum } from '~/core/enums/campaign/incentive-unit.enum';
import { OperatorService } from '~/modules/operator/services/operator.service';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { CampaignStatusEnum } from '~/core/enums/campaign/campaign-status.enum';
import { CampaignUx } from '~/core/entities/campaign/ux-format/campaign-ux';
import { CampaignService } from '~/modules/campaign/services/campaign.service';
import { CampaignUiService } from '~/modules/campaign/services/campaign-ui.service';

@Component({
  selector: 'app-summary-form',
  templateUrl: './summary-form.component.html',
  styleUrls: ['./summary-form.component.scss'],
})
export class SummaryFormComponent extends DestroyObservable implements OnInit {
  @Input() campaignForm: FormGroup;
  @Input() loading: boolean;
  @Output() onSaveCampaign: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    public utils: UtilsService,
    private operatorService: OperatorService,
    private toastr: ToastrService,
    private campaignService: CampaignService,
    private campaignSummaryService: CampaignUiService,
  ) {
    super();
  }

  ngOnInit() {}

  get controls() {
    return this.campaignForm.controls;
  }

  get retributionParametersControls() {
    const formGroup = <FormGroup>this.campaignForm.get('retributionParameters');
    return formGroup.controls;
  }

  getSummaryText(): string {
    const campaign: CampaignUx = this.campaignForm.getRawValue();

    let summaryText = this.campaignSummaryService.summary(campaign);

    // OPERATORS ( not public )
    const nbOperators = campaign.filters.operator_ids ? campaign.filters.operator_ids.length : 0;
    if (nbOperators === this.operatorService.entities.length) {
      summaryText += `La campagne est accessible à tous les opérateurs présents sur le registre (${nbOperators}).`;
    } else {
      summaryText += `La campagne est limitée à ${nbOperators} opérateur(s) présent(s) sur le registre.`;
    }
    return summaryText;
  }

  copySummary(summary: string): void {
    this.utils.copySelectionToClipboarcById('summary');
    this.toastr.success('Le récapitulatif a été copié !');
  }

  saveCampaign(isTemplate: boolean) {
    if (isTemplate) {
      this.controls.status.setValue(CampaignStatusEnum.TEMPLATE);
    }
    this.onSaveCampaign.emit();
  }
}
