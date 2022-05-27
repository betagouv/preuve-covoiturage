import { Component, Input, OnInit } from '@angular/core';

import { CampaignUx } from '~/core/entities/campaign/ux-format/campaign-ux';
import { Roles } from '~/core/enums/user/roles';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { CampaignUiService } from '~/modules/campaign/services/campaign-ui.service';
import { CampaignStatusEnum } from '~/core/enums/campaign/campaign-status.enum';
import { ResultInterface as CampaignInterface } from '~/shared/policy/find.contract';

@Component({
  selector: 'app-campaign-retribution-view',
  templateUrl: './campaign-retribution-view.component.html',
  styleUrls: ['./campaign-retribution-view.component.scss'],
})
export class CampaignRetributionViewComponent implements OnInit {
  @Input() campaignInterface: CampaignInterface;
  @Input() campaign: CampaignUx;
  constructor(private _authenticationService: AuthenticationService, private _campaignUiService: CampaignUiService) {}

  ngOnInit(): void {}

  get canEdit(): boolean {
    return (
      (this._authenticationService.hasRole(Roles.TerritoryAdmin) ||
        this._authenticationService.hasRole(Roles.TerritoryDemo)) &&
      this.campaign.status === CampaignStatusEnum.DRAFT
    );
  }

  get retributionRule(): string {
    return this._campaignUiService.retributions(this.campaign);
  }

  get restrictions(): string {
    return this._campaignUiService.restrictions(this.campaign.restrictions, this.campaign.unit);
  }
}
