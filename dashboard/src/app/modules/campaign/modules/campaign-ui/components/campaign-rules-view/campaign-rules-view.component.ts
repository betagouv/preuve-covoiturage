import { Component, Input, OnInit } from '@angular/core';

import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { CampaignUiService } from '~/modules/campaign/services/campaign-ui.service';

import { PolicyInterface } from '~/shared/policy/common/interfaces/PolicyInterface';

@Component({
  selector: 'app-campaign-rules-view',
  templateUrl: './campaign-rules-view.component.html',
  styleUrls: ['./campaign-rules-view.component.scss'],
})
export class CampaignRulesViewComponent implements OnInit {
  @Input() campaign: PolicyInterface;
  constructor(private _authenticationService: AuthenticationService, private _campaignUiService: CampaignUiService) {}

  ngOnInit(): void {}

  get daysAndTimes(): string {
    return this.campaign.description;
  }
}
