import { Component, Input, OnInit } from '@angular/core';

import { CampaignUx } from '~/core/entities/campaign/ux-format/campaign-ux';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { Roles } from '~/core/enums/user/roles';
import { CampaignUiService } from '~/modules/campaign/services/campaign-ui.service';
import { ResultInterface as CampaignInterface } from '~/shared/policy/find.contract';
import { CampaignStatusEnum } from '~/core/enums/campaign/campaign-status.enum';

@Component({
  selector: 'app-campaign-rules-view',
  templateUrl: './campaign-rules-view.component.html',
  styleUrls: ['./campaign-rules-view.component.scss'],
})
export class CampaignRulesViewComponent implements OnInit {
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

  get targets(): string {
    const forDriver = this.campaign.ui_status.for_driver;
    const forPassenger = this.campaign.ui_status.for_passenger;
    // const forTrip = this.campaign.ui_status.for_trip;
    const onlyAdult = this.campaign.only_adult;
    // return this._campaignUiService.targets(forDriver, forPassenger, forTrip, onlyAdult);
    return this._campaignUiService.targets(forDriver, forPassenger, onlyAdult);
  }

  get ranks(): string {
    const rankSlug = this.campaignInterface.global_rules.find((r) => r.slug === 'rank_whitelist_filter');
    if (!rankSlug) {
      return '';
    }
    return this._campaignUiService.ranks(rankSlug.parameters);
  }

  get insee(): string {
    const insee = this.campaign.filters.insee;
    if (insee) {
      return this._campaignUiService.insee(insee);
    }
    return 'Aucune restriction géographique.';
  }

  get distance(): string {
    const range = this.campaign.filters.distance_range;
    if (!range) {
      return '';
    }
    return this._campaignUiService.distance(range);
  }
}
