import { Component, Input, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { takeUntil } from 'rxjs/operators';

import { Campaign } from '~/core/entities/campaign/api-format/campaign';
import { DialogService } from '~/core/services/dialog.service';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { CampaignStatusEnum } from '~/core/enums/campaign/campaign-status.enum';
import { CampaignUx } from '~/core/entities/campaign/ux-format/campaign-ux';

import { CampaignService } from '~/modules/campaign/services/campaign.service';
import { CampaignFormatingService } from '~/modules/campaign/services/campaign-formating.service';

@Component({
  selector: 'app-campaigns-list',
  templateUrl: './campaigns-list.component.html',
  styleUrls: ['./campaigns-list.component.scss'],
})
export class CampaignsListComponent extends DestroyObservable implements OnInit {
  @Input() campaignStatusList: CampaignStatusEnum[] = [];
  campaigns: CampaignUx[] = [];
  CampaignStatusEnum = CampaignStatusEnum;

  constructor(
    private dialog: DialogService,
    public campaignService: CampaignService,
    public campaignFormatService: CampaignFormatingService,
    private toastr: ToastrService,
  ) {
    super();
  }

  ngOnInit() {
    this.loadCampaigns();
  }

  private loadCampaigns(): void {
    this.campaignService.entities$.pipe(takeUntil(this.destroy$)).subscribe((campaigns: Campaign[]) => {
      this.filterCampaignsByStatus(campaigns);
    });

    if (this.campaignService.campaignsLoaded) {
      return;
    }
    this.campaignService
      .load()
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  public filterCampaignsByStatus(campaigns: Campaign[]): void {
    const statusList = this.campaignStatusList;
    this.campaigns = campaigns
      .filter((c: Campaign) => statusList.length === 0 || statusList.indexOf(c.status) !== -1)
      .map((campaign: Campaign) => this.campaignFormatService.toCampaignUxFormat(campaign))
      .sort((a, b) => (a.start.isAfter(b.start) ? -1 : 1));
  }

  launchCampaign(id: string): void {
    this.dialog
      .confirm('Lancement de la campagne', 'Êtes-vous sûr de vouloir lancer la campagne ?', 'Confirmer')
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          this.campaignService
            .launch(id)
            .pipe(takeUntil(this.destroy$))
            .subscribe(
              (data) => {
                const campaignSaved = data[0];
                // tslint:disable-next-line:max-line-length
                this.toastr.success(`La campagne ${campaignSaved.name} a bien été lancé`);
              },
              (error) => {
                console.error(error);
                this.toastr.error('Une erreur est survenue lors du lancement de la campagne');
              },
            );
        }
      });
  }

  deleteCampaign(campaign: CampaignUx): void {
    this.dialog
      .confirm('Suppression', `Êtes-vous sûr de vouloir supprimer la campagne: ${campaign.name} ?`, 'Supprimer')
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          this.campaignService
            .deleteTemplateOrDraft(campaign._id)
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
