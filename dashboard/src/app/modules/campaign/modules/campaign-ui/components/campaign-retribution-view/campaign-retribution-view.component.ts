import { Component, Input, OnInit } from '@angular/core';

import { CampaignUx } from '~/core/entities/campaign/ux-format/campaign-ux';
import { UserRoleEnum } from '~/core/enums/user/user-role.enum';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { CampaignUiService } from '~/modules/campaign/services/campaign-ui.service';
import { CampaignStatusEnum } from '~/core/enums/campaign/campaign-status.enum';

@Component({
  selector: 'app-campaign-retribution-view',
  templateUrl: './campaign-retribution-view.component.html',
  styleUrls: ['./campaign-retribution-view.component.scss'],
})
export class CampaignRetributionViewComponent implements OnInit {
  @Input() campaign: CampaignUx;
  constructor(private _authenticationService: AuthenticationService, private _campaignUiService: CampaignUiService) {}

  ngOnInit() {}

  get canEdit() {
    return (
      this._authenticationService.hasRole(UserRoleEnum.TERRITORY_ADMIN) &&
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
