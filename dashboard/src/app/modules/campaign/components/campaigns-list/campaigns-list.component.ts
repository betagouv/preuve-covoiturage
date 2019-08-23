import { Component, Input, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { Campaign } from '~/core/entities/campaign/campaign';
import { CampaignStatus } from '~/core/entities/campaign/campaign-status';
import { DialogService } from '~/core/services/dialog.service';
import { CampaignService } from '~/modules/campaign/services/campaign.service';

@Component({
  selector: 'app-campaigns-list',
  templateUrl: './campaigns-list.component.html',
  styleUrls: ['./campaigns-list.component.scss'],
})
export class CampaignsListComponent implements OnInit {
  @Input() campaigns: Campaign[];
  campaignStatus = CampaignStatus;

  constructor(
    private _dialog: DialogService,
    private _campaignService: CampaignService,
    private _toast: ToastrService,
  ) {}

  ngOnInit() {}

  deleteCampaign(campaign: Campaign) {
    this._dialog
      .confirm('Suppression', `Êtes-vous sûr de vouloir supprimer la campagne: ${campaign.name} ?`, 'Supprimer')
      .subscribe((result) => {
        if (result) {
          this._campaignService.delete(campaign).subscribe(
            () => {
              this._toast.success('La campagne a bien été supprimée');
            },
            (err) => {
              this._toast.error(err.message);
            },
          );
        }
      });
  }
}
