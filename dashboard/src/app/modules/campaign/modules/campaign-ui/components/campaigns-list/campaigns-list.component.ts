import { Component, Input, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { takeUntil } from 'rxjs/operators';

import { Campaign } from '~/core/entities/campaign/campaign';
import { CampaignStatus } from '~/core/entities/campaign/campaign-status';
import { CampaignService } from '~/modules/campaign/services/campaign.service';
import { campaignMocks } from '~/modules/campaign/mocks/campaigns';
import { DialogService } from '~/core/services/dialog.service';
import { DestroyObservable } from '~/core/components/destroy-observable';

@Component({
  selector: 'app-campaigns-list',
  templateUrl: './campaigns-list.component.html',
  styleUrls: ['./campaigns-list.component.scss'],
})
export class CampaignsListComponent extends DestroyObservable implements OnInit {
  @Input() campaignStatus: CampaignStatus | null;
  campaigns: Campaign[];
  campaignStatusType = CampaignStatus;

  constructor(private dialog: DialogService, public campaignService: CampaignService, private toastr: ToastrService) {
    super();
  }

  ngOnInit() {
    this.loadCampaigns();
  }

  private loadCampaigns(): void {
    this.campaignService._entities$.pipe(takeUntil(this.destroy$)).subscribe((campaigns: Campaign[]) => {
      this.filterCampaignsByStatus(campaigns);
    });

    if (this.campaignService.loading) {
      return;
    }
    this.campaignService
      .load()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (campaigns) => {
          //
        },
        (err) => {
          this.toastr.error(err.message);

          // TODO TMP TO DELETE
          this.campaignService._entities$.next(campaignMocks);
        },
      );
  }

  public filterCampaignsByStatus(campaigns: Campaign[]): void {
    const status = this.campaignStatus;
    this.campaigns = campaigns.filter((c: Campaign) => !status || c.status === status);
  }

  deleteCampaign(campaign: Campaign) {
    this.dialog
      .confirm('Suppression', `Êtes-vous sûr de vouloir supprimer la campagne: ${campaign.name} ?`, 'Supprimer')
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          this.campaignService
            .delete(campaign)
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
