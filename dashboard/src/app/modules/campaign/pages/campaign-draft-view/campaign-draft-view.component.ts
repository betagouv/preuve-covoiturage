import { Component, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
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

@Component({
  selector: 'app-campaign-draft-view',
  templateUrl: './campaign-draft-view.component.html',
  styleUrls: ['./campaign-draft-view.component.scss'],
})
export class CampaignDraftViewComponent extends DestroyObservable implements OnInit {
  territory: Territory;
  campaignUx: CampaignUx;
  userIsDemo: boolean;

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
    this.loadTerritory();

    this._authService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => (this.userIsDemo = this._authService.hasRole(UserRoleEnum.TERRITORY_DEMO)));
  }

  get isLoading(): boolean {
    return !this.territory || !this.campaignUx;
  }

  private loadCampaign(campaignId: number): void {
    console.log('> loadCampaign');
    this._campaignStoreService
      .getById(campaignId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (campaign: Campaign) => {
          this.campaignUx = campaign.toFormValues();
        },
        (err) => {
          this._router.navigate(['/campaign']).then(() => {
            this._toastr.error("Les données de la campagne n'ont pas pu être chargées");
          });
        },
      );

    // if (!this._campaignStoreService.loaded) {
    //   if (this._authService.user.group === UserGroupEnum.TERRITORY) {
    //     this._campaignStoreService.filterSubject.next({ territory_id: this._authService.user.territory_id });
    //   }
    //   this._campaignStoreService.loadList();
    // }
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
