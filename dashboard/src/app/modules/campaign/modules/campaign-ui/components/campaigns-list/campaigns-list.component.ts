import { Component, Input, OnInit } from '@angular/core';

import { DestroyObservable } from '~/core/components/destroy-observable';
import { CampaignUx } from '~/core/entities/campaign/ux-format/campaign-ux';
import { CampaignStatusEnum } from '~/core/enums/campaign/campaign-status.enum';
import { IncentiveUnitEnum } from '~/core/enums/campaign/incentive-unit.enum';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';

@Component({
  selector: 'app-campaigns-list',
  templateUrl: './campaigns-list.component.html',
  styleUrls: ['./campaigns-list.component.scss'],
})
export class CampaignsListComponent extends DestroyObservable implements OnInit {
  @Input() campaignStatusList: CampaignStatusEnum[] = [];
  @Input() campaigns: CampaignUx[];
  @Input() loading = false;
  @Input() loaded = false;
  @Input() noCampaignMessage = `Vous n'avez pas de campagnes.`;

  CampaignStatusEnum = CampaignStatusEnum;

  constructor(public auth: AuthenticationService) {
    super();
  }

  ngOnInit(): void {}

  showEdition(status: CampaignStatusEnum): boolean {
    return status === CampaignStatusEnum.DRAFT && this.auth.isTerritory();
  }

  showValid(status: CampaignStatusEnum): boolean {
    return (
      status === CampaignStatusEnum.VALIDATED ||
      status === CampaignStatusEnum.PENDING ||
      status === CampaignStatusEnum.ARCHIVED
    );
  }

  showDelete(status: CampaignStatusEnum): boolean {
    return (status === CampaignStatusEnum.ARCHIVED || status === CampaignStatusEnum.DRAFT) && this.auth.isTerritory();
  }

  isEuro(unit: IncentiveUnitEnum): boolean {
    return unit === IncentiveUnitEnum.EUR;
  }

  get filteredCampaigns(): CampaignUx[] {
    if (!this.campaigns) return null;
    const statusList = this.campaignStatusList;
    return this.campaigns
      .filter((c: CampaignUx) => statusList.length === 0 || statusList.indexOf(c.status) !== -1)
      .sort((a, b) => (a.start.isAfter(b.start) ? -1 : 1));
  }
}
