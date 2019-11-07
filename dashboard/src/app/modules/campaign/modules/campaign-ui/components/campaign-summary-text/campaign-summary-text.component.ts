import { Component, Input, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { CampaignUx } from '~/core/entities/campaign/ux-format/campaign-ux';
import { UtilsService } from '~/core/services/utils.service';
import { CampaignUiService } from '~/modules/campaign/services/campaign-ui.service';

@Component({
  selector: 'app-campaign-summary-text',
  templateUrl: './campaign-summary-text.component.html',
  styleUrls: ['./campaign-summary-text.component.scss'],
})
export class CampaignSummaryTextComponent {
  @Input() campaign: CampaignUx;

  constructor(
    private _utils: UtilsService,
    private _campaignUiService: CampaignUiService,
    private _toastr: ToastrService,
  ) {}

  get summary(): string {
    return this._campaignUiService.summary(this.campaign);
  }

  copySummary(summary: string): void {
    this._utils.copyToClipboard(summary);
    this._toastr.success('Le récapitulatif a été copié !');
  }
}
