import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { UtilsService } from '~/core/services/utils.service';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { CampaignStatusEnum } from '~/core/enums/campaign/campaign-status.enum';
import { CampaignUx } from '~/core/entities/campaign/ux-format/campaign-ux';
import { CampaignUiService } from '~/modules/campaign/services/campaign-ui.service';

@Component({
  selector: 'app-summary-form',
  templateUrl: './summary-form.component.html',
  styleUrls: ['./summary-form.component.scss'],
})
export class SummaryFormComponent extends DestroyObservable implements OnInit {
  @Input() campaignForm: FormGroup;
  @Input() isCreating: boolean;
  @Input() loading: boolean;
  @Output() onSaveCampaign: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    public utils: UtilsService,
    private toastr: ToastrService,
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

    return this.campaignSummaryService.summary(campaign);
  }

  copySummary(summary: string): void {
    this.utils.copySelectionToClipboarcById('summary');
    this.toastr.success('Le récapitulatif a été copié !');
  }

  saveCampaign(isTemplate: boolean = false) {
    if (isTemplate) {
      this.controls.status.setValue(CampaignStatusEnum.TEMPLATE);
    }
    this.onSaveCampaign.emit();
  }
}
