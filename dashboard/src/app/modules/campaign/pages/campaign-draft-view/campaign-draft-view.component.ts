import { Component, OnInit } from '@angular/core';
import { mergeMap, takeUntil, tap } from 'rxjs/operators';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { Territory } from '~/core/entities/territory/territory';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { Campaign } from '~/core/entities/campaign/api-format/campaign';
import { CampaignUx } from '~/core/entities/campaign/ux-format/campaign-ux';
import { CommonDataService } from '~/core/services/common-data.service';
import { DialogService } from '~/core/services/dialog.service';
import { CampaignStoreService } from '~/modules/campaign/services/campaign-store.service';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { UserRoleEnum } from '~/core/enums/user/user-role.enum';
import { TerritoryApiService } from '~/modules/territory/services/territory-api.service';

@Component({
  selector: 'app-campaign-draft-view',
  templateUrl: './campaign-draft-view.component.html',
  styleUrls: ['./campaign-draft-view.component.scss'],
})
export class CampaignDraftViewComponent extends DestroyObservable implements OnInit {
  territory: Territory;
  campaignUx: CampaignUx;
  userIsDemo: boolean;
  userIsRegistry: boolean;

  constructor(
    private _authService: AuthenticationService,
    private _commonDataService: CommonDataService,
    private _territoryApi: TerritoryApiService,
    private _dialog: DialogService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _campaignStoreService: CampaignStoreService,
    private _toastr: ToastrService,
  ) {
    super();
  }

  ngOnInit(): void {
    document.getElementsByClassName('AuthenticatedLayout-body')[0].scrollTop = 0;
    this._route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params: ParamMap) => {
      const notFound = !params.has('campaignId');
      if (notFound) {
        this._router.navigate(['/404']);
      } else {
        // tslint:disable-next-line:no-debugger
        this.loadCampaign(Number(params.get('campaignId')));
      }
    });

    this._authService.user$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.userIsDemo = this._authService.hasRole(UserRoleEnum.TERRITORY_DEMO);
      this.userIsRegistry =
        this._authService.hasRole(UserRoleEnum.REGISTRY_ADMIN) || this._authService.hasRole(UserRoleEnum.REGISTRY_USER);
    });
  }

  get isLoading(): boolean {
    return !this.territory || !this.campaignUx;
  }

  private loadCampaign(campaignId: number): void {
    this._campaignStoreService
      .getById(campaignId)
      .pipe(
        takeUntil(this.destroy$),
        tap(
          (campaign: Campaign) => {
            this.campaignUx = campaign.toFormValues();
          },
          (err) => {
            console.warn('err : ', err);
            this._router.navigate(['/campaign']).then(() => {
              this._toastr.error("Les données de la campagne n'ont pas pu être chargées");
            });
          },
        ),
        mergeMap((campaign) => this._territoryApi.find({ _id: campaign.territory_id })),
        tap((territory) => (this.territory = territory)),
      )
      .subscribe();
  }

  launchCampaign(id: number): void {
    // this._toastr.info(`Vous ne pouvez pas encore lancer de campagne.`);

    if (this.userIsDemo) {
      this._toastr.error(
        `Vous ne pouvez pas lancer de campagne car vous êtes en mode découverte.
        Veuillez contacter le registre de covoiturage pour activer votre compte.`,
      );

      return;
    }

    this._dialog
      .confirm({
        title: 'Lancement de la campagne',
        message: 'Êtes-vous sûr de vouloir lancer la campagne ?',
        confirmBtn: 'Confirmer',
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          this._campaignStoreService
            .launch(id)
            .pipe(takeUntil(this.destroy$))
            .subscribe(
              () => {
                this._router.navigate(['/campaign']).then(() => {
                  this._toastr.success(`Votre campagne a bien été lancée`);
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

  private loadTerritory(): void {
    this._commonDataService.currentTerritory$
      .pipe(takeUntil(this.destroy$))
      .subscribe((territory) => (this.territory = territory));
  }
}
