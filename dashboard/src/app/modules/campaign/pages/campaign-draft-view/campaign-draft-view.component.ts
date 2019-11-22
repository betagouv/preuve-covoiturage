import { Component, OnInit } from '@angular/core';
import { filter, takeUntil, tap } from 'rxjs/operators';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { pipe } from 'rxjs';

import { Territory } from '~/core/entities/territory/territory';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { Campaign } from '~/core/entities/campaign/api-format/campaign';
import { CampaignService } from '~/modules/campaign/services/campaign.service';
import { CampaignFormatingService } from '~/modules/campaign/services/campaign-formating.service';
import { CampaignUx } from '~/core/entities/campaign/ux-format/campaign-ux';
import { CommonDataService } from '~/core/services/common-data.service';
import { DialogService } from '~/core/services/dialog.service';

@Component({
  selector: 'app-campaign-draft-view',
  templateUrl: './campaign-draft-view.component.html',
  styleUrls: ['./campaign-draft-view.component.scss'],
})
export class CampaignDraftViewComponent extends DestroyObservable implements OnInit {
  territory: Territory;
  campaignUx: CampaignUx;

  constructor(
    private _commonDataService: CommonDataService,
    private _dialog: DialogService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _campaignService: CampaignService,
    private _campaignFormatService: CampaignFormatingService, // todo: refactor, this should not be need,
    private _toastr: ToastrService,
  ) {
    super();
  }

  ngOnInit() {
    document.getElementsByClassName('AuthenticatedLayout-body')[0].scrollTo(0, 0);
    this._route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params: ParamMap) => {
      const notFound = !params.has('campaignId');
      if (notFound) {
        this._router.navigate(['/404']);
      } else {
        this.loadCampaign(Number(params.get('campaignId')));
      }
    });
    this.loadTerritory();
  }

  get isLoading() {
    return !this.territory || !this.campaignUx;
  }

  private loadCampaign(campaignId: number) {
    if (!this._campaignService.campaignsLoaded) {
      this._campaignService
        .load()
        .pipe(takeUntil(this.destroy$))
        .subscribe();
    }
    this._campaignService.entities$
      .pipe(
        filter((campaigns) => campaigns.length > 0),
        takeUntil(this.destroy$),
      )
      .subscribe((campaigns: Campaign[]) => {
        const foundCampaign = campaigns.filter((campaign) => campaign._id === campaignId)[0];
        if (foundCampaign) {
          this.campaignUx = this._campaignFormatService.toCampaignUxFormat(foundCampaign);
        } else {
          this._router.navigate(['/campaign']).then(() => {
            this._toastr.error("Les données de la campagne n'ont pas pu être chargées");
          });
        }
      });
  }

  launchCampaign(id: number): void {
    this._dialog
      .confirm('Lancement de la campagne', 'Êtes-vous sûr de vouloir lancer la campagne ?', 'Confirmer')
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          this._campaignService
            .launch(id)
            .pipe(takeUntil(this.destroy$))
            .subscribe(
              (data) => {
                const campaignSaved = data[0];
                this._router.navigate(['/campaign']).then(() => {
                  this._toastr.success(`La campagne ${campaignSaved.name} a bien été lancé`);
                });
              },
              (error) => {
                console.error(error);
                this._toastr.error('Une erreur est survenue lors du lancement de la campagne');
              },
            );
        }
      });
  }

  private loadTerritory() {
    this._commonDataService.currentTerritory$
      .pipe(takeUntil(this.destroy$))
      .subscribe((territory) => (this.territory = territory));
  }
}
