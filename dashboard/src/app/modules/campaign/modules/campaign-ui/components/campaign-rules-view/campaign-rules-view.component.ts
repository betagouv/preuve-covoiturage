import { Component, Input, OnInit } from '@angular/core';

import { CampaignUx } from '~/core/entities/campaign/ux-format/campaign-ux';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { UserRoleEnum } from '~/core/enums/user/user-role.enum';
import { CampaignUiService } from '~/modules/campaign/services/campaign-ui.service';
import { CampaignStatusEnum } from '~/core/enums/campaign/campaign-status.enum';

@Component({
  selector: 'app-campaign-rules-view',
  templateUrl: './campaign-rules-view.component.html',
  styleUrls: ['./campaign-rules-view.component.scss'],
})
export class CampaignRulesViewComponent implements OnInit {
  @Input() campaign: CampaignUx;
  constructor(private _authenticationService: AuthenticationService, private _campaignUiService: CampaignUiService) {}

  ngOnInit(): void {}

  get canEdit(): boolean {
    return (
      this._authenticationService.hasRole(UserRoleEnum.TERRITORY_ADMIN) &&
      this.campaign.status === CampaignStatusEnum.DRAFT
    );
  }
  get daysAndTimes(): string {
    const weekDays = this.campaign.filters.weekday;
    const timeRanges = this.campaign.filters.time;
    if (!weekDays) {
      return '';
    }
    return this._campaignUiService.daysAndTimes(weekDays, timeRanges);
  }

  get targets(): string {
    const forDriver = this.campaign.ui_status.for_driver;
    const forPassenger = this.campaign.ui_status.for_passenger;
    const forTrip = this.campaign.ui_status.for_trip;
    const onlyAdult = this.campaign.only_adult;
    return this._campaignUiService.targets(forDriver, forPassenger, forTrip, onlyAdult);
  }

  get ranks(): string {
    const rank = this.campaign.filters.rank;
    if (!rank) {
      return '';
    }
    return this._campaignUiService.ranks(rank);
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
