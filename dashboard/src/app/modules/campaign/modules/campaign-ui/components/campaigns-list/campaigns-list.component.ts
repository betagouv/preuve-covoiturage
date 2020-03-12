import { Component, Input, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { takeUntil } from 'rxjs/operators';

import { DialogService } from '~/core/services/dialog.service';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { CampaignStatusEnum } from '~/core/enums/campaign/campaign-status.enum';
import { CampaignUx } from '~/core/entities/campaign/ux-format/campaign-ux';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { UserGroupEnum } from '~/core/enums/user/user-group.enum';
import { CampaignStoreService } from '~/modules/campaign/services/campaign-store.service';
import { IncentiveUnitEnum } from '~/core/enums/campaign/incentive-unit.enum';

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

  constructor(
    private dialog: DialogService,
    private _authService: AuthenticationService,
    private _campaignStoreService: CampaignStoreService,
    private toastr: ToastrService,
  ) {
    super();
  }

  ngOnInit(): void {}

  showEdition(status: CampaignStatusEnum): boolean {
    return status === CampaignStatusEnum.DRAFT && this._authService.hasAnyGroup([UserGroupEnum.TERRITORY]);
  }

  showValid(status: CampaignStatusEnum): boolean {
    return (
      status === CampaignStatusEnum.VALIDATED ||
      status === CampaignStatusEnum.PENDING ||
      status === CampaignStatusEnum.ARCHIVED
    );
  }

  showDelete(status: CampaignStatusEnum): boolean {
    return (
      (status === CampaignStatusEnum.ARCHIVED || status === CampaignStatusEnum.DRAFT) &&
      this._authService.hasAnyGroup([UserGroupEnum.TERRITORY])
    );
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

  deleteCampaign(campaign: CampaignUx): void {
    this.dialog
      .confirm({
        title: `Êtes-vous sûr de vouloir supprimer la campagne : ${campaign.name} ?`,
        confirmBtn: 'Supprimer',
        color: 'warn',
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          const params = {
            territory_id: this._authService.user.territory_id,
          };
          this._campaignStoreService
            .deleteByTerritoryId({ _id: campaign._id, ...params })
            .pipe(takeUntil(this.destroy$))
            .subscribe(
              () => {
                this.toastr.success('La campagne a bien été supprimée');
              },
              (err) => {
                this.toastr.error(err.message);
              },
            );
        }
      });
  }
}
