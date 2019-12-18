import { Component, OnInit } from '@angular/core';
import { filter, take, takeUntil, tap } from 'rxjs/operators';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { Territory } from '~/core/entities/territory/territory';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { Campaign } from '~/core/entities/campaign/api-format/campaign';
import { CampaignUx } from '~/core/entities/campaign/ux-format/campaign-ux';
import { CommonDataService } from '~/core/services/common-data.service';
import { DialogService } from '~/core/services/dialog.service';
import { CampaignStoreService } from '~/modules/campaign/services/campaign-store.service';
import { UserGroupEnum } from '~/core/enums/user/user-group.enum';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';

@Component({
  selector: 'app-campaign-draft-view',
  templateUrl: './campaign-draft-view.component.html',
  styleUrls: ['./campaign-draft-view.component.scss'],
})
export class CampaignDraftViewComponent extends DestroyObservable implements OnInit {
  territory: Territory;
  campaignUx: CampaignUx;

  constructor(
    private _authService: AuthenticationService,
    private _commonDataService: CommonDataService,
    private _dialog: DialogService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _campaignStoreService: CampaignStoreService,
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
        // tslint:disable-next-line:no-debugger
        this.loadCampaign(Number(params.get('campaignId')));
      }
    });
    this.loadTerritory();
  }

  get isLoading() {
    return !this.territory || !this.campaignUx;
  }

  private loadCampaign(campaignId: number) {
    this._campaignStoreService
      .selectEntityByIdFromList(campaignId)
      .pipe(
        take(1),
        takeUntil(this.destroy$),
      )
      .subscribe(
        (campaign: Campaign) => {
          console.log({ campaign });
          this.campaignUx = campaign.toFormValues();
        },
        (err) => {
          this._router.navigate(['/campaign']).then(() => {
            this._toastr.error("Les données de la campagne n'ont pas pu être chargées");
          });
        },
      );

    if (!this._campaignStoreService.loaded) {
      if (this._authService.user.group === UserGroupEnum.TERRITORY) {
        this._campaignStoreService.filterSubject.next({ territory_id: this._authService.user.territory_id });
      }
      this._campaignStoreService.loadList();
    }
  }

  launchCampaign(id: number): void {
    this._toastr.info(`Vous ne pouvez pas encore lancer de campagne.`);
    // this._dialog
    //   .confirm('Lancement de la campagne', 'Êtes-vous sûr de vouloir lancer la campagne ?', 'Confirmer')
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe((result) => {
    //     if (result) {
    //       this._campaignStoreService
    //         .launch(id)
    //         .pipe(takeUntil(this.destroy$))
    //         .subscribe(
    //           (data) => {
    //             const campaignSaved = data[0];
    //             this._router.navigate(['/campaign']).then(() => {
    //               this._toastr.success(`La campagne ${campaignSaved.name} a bien été lancé`);
    //             });
    //           },
    //           (error) => {
    //             console.error(error);
    //             this._toastr.error('Une erreur est survenue lors du lancement de la campagne');
    //           },
    //         );
    //     }
    //   });
  }

  private loadTerritory() {
    this._commonDataService.currentTerritory$
      .pipe(takeUntil(this.destroy$))
      .subscribe((territory) => (this.territory = territory));
  }
}
