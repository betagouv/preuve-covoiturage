import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { MatStepper } from '@angular/material';
import { takeUntil, map } from 'rxjs/operators';

import { CampaignStatusEnum } from '~/core/enums/campaign/campaign-status.enum';
import { RulesRangeUxType } from '~/core/types/campaign/rulesRangeInterface';
import { DialogService } from '~/core/services/dialog.service';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { Campaign } from '~/core/entities/campaign/api-format/campaign';
import { CampaignUx } from '~/core/entities/campaign/ux-format/campaign-ux';
import { TripRankEnum } from '~/core/enums/trip/trip-rank.enum';
import { CAMPAIGN_RULES_MAX_DISTANCE_KM } from '~/core/const/campaign/rules.const';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { CampaignApiService } from '~/modules/campaign/services/campaign-api.service';
import { CampaignStoreService } from '~/modules/campaign/services/campaign-store.service';
import { CampaignInterface } from '~/core/entities/api/shared/policy/common/interfaces/CampaignInterface';

import { uniqueRetributionValidator } from '../../validators/retribution-unique.validator';

@Component({
  selector: 'app-campaign-form',
  templateUrl: './campaign-form.component.html',
  styleUrls: ['./campaign-form.component.scss'],
})
export class CampaignFormComponent extends DestroyObservable implements OnInit {
  @Input() campaignId: number;
  @Input() parentId: number;
  @Input() section: number;

  helpCard = {
    svgIcon: 'new_car',
    title: 'Vous êtes nouveau sur Preuve de covoiturage ?',
    hint: 'Découvrez comment développer une politique de covoiturage efficace dans votre collectivité',
    link: 'https://registre-preuve-de-covoiturage.gitbook.io/produit/boite-a-outils/guide-des-incitations',
  };

  creationFromScratch = false;
  creationFromParentId = false;

  campaignFormGroup: FormGroup;
  requestLoading = false;
  loading = true;
  currentStep = 0;
  matStepperCompleted = false;

  private _defaultRange: RulesRangeUxType = [0, CAMPAIGN_RULES_MAX_DISTANCE_KM];
  @ViewChild('stepper', { static: false }) _matStepper: MatStepper;
  public userIsDemo: boolean;

  constructor(
    private _authService: AuthenticationService,
    private _dialog: DialogService,
    private _formBuilder: FormBuilder,
    private _campaignApiService: CampaignApiService,
    private _campaignStoreService: CampaignStoreService,
    private _toastr: ToastrService,
    private _router: Router,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initForms();
    if (this.campaignId) {
      this.loadCampaign(this.campaignId);
    } else if (this.parentId) {
      this.creationFromParentId = true;
      // todo: get date range and reproduce same date range in duplicate
      this.loadCampaign(this.parentId, true);
    } else {
      this._campaignStoreService.selectNew();
      this.creationFromScratch = true;
      this.loading = false;
    }

    this._authService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => (this.userIsDemo = user && user.role.indexOf('demo') !== -1));

    this.initCampaigns();
  }

  public get controls(): { [key: string]: AbstractControl } {
    return this.campaignFormGroup.controls;
  }

  get showFirstPageNextStep(): void {
    return this.campaignFormGroup.controls.parent_id.value || this.campaignId;
  }

  get canGoToThirdStep(): boolean {
    const filtersFormGroup = this.campaignFormGroup.get('filters');

    const targetValid =
      this.campaignFormGroup.get('ui_status').get('for_trip').value ||
      this.campaignFormGroup.get('ui_status').get('for_passenger').value ||
      this.campaignFormGroup.get('ui_status').get('for_driver').value;

    return (
      targetValid &&
      filtersFormGroup.get('weekday').valid &&
      filtersFormGroup.get('distance_range').valid &&
      filtersFormGroup.get('rank').valid &&
      filtersFormGroup.get('insee').valid &&
      filtersFormGroup.get('operator_ids').valid &&
      this.campaignFormGroup.get('only_adult').valid
    );
  }

  get canGoToLastStep(): boolean {
    return (
      this.campaignFormGroup.get('filters').valid &&
      this.campaignFormGroup.get('max_amount').valid &&
      this.campaignFormGroup.get('max_trips').valid &&
      this.campaignFormGroup.get('start').valid &&
      this.campaignFormGroup.get('end').valid &&
      this.campaignFormGroup.get('unit').valid &&
      this.campaignFormGroup.get('restrictions').valid &&
      this.campaignFormGroup.get('retributions').valid
    );
  }

  saveCampaign(): void {
    const formValues = this.campaignFormGroup.getRawValue();

    // get territory of user
    if (this._authService.user.territory_id) {
      formValues.territory_id = this._authService.user.territory_id;
    }

    if (this.creationFromScratch || this.creationFromParentId) {
      this.createCampaign(formValues);
    } else {
      const campaign = new Campaign();
      this.patchCampaign(campaign.toCampaignPatch(formValues));
    }
  }

  private patchCampaign(params: CampaignInterface): void {
    this._campaignStoreService
      .patchSelected(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          console.log('data : ', data);
          this.requestLoading = false;
          this._router.navigate([`/campaign/draft/${this.campaignId}`]).then(() => {
            this._toastr.success(`La campagne ${params.name} a bien été mise à jour`);
          });
        },
        (error) => {
          this.requestLoading = false;
          console.error(error);
          this._toastr.error('Une erreur est survenue lors de la mise à jour de la campagne');
        },
      );
  }

  private createCampaign(formValues: CampaignUx): void {
    this._campaignStoreService
      .create(formValues)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.requestLoading = false;
          this._toastr.success(`La campagne ${formValues.name} a bien été enregistrée`);
          this._router.navigate(['/campaign']);
        },
        (error) => {
          this.requestLoading = false;
          console.error(error);
          this._toastr.error("Une erreur est survenue lors de l'enregistrement de la campagne");
        },
      );
  }

  private initForms(): void {
    this.campaignFormGroup = this._formBuilder.group({
      name: [null, Validators.required],
      description: [null],
      status: [],
      filters: this._formBuilder.group({
        weekday: [null, Validators.required],
        time: this._formBuilder.array([]),
        distance_range: [this._defaultRange, Validators.required],
        rank: [null, Validators.required],
        operator_ids: [[]],
        all_operators: [true],
        insee: this._formBuilder.group({
          whiteList: this._formBuilder.array([]),
          blackList: this._formBuilder.array([]),
        }),
      }),
      only_adult: [null],
      ui_status: this._formBuilder.group({
        for_driver: [null],
        for_passenger: [null],
        for_trip: [null],
        staggered: [false],
        insee_mode: [false],
      }),
      passenger_seat: [true],
      start: [null, Validators.required],
      end: [null, Validators.required],
      max_amount: [null, [Validators.required, Validators.min(1)]],
      unit: [null, Validators.required],
      max_trips: [null, Validators.min(1)],
      parent_id: [null],
      restrictions: this._formBuilder.array([]),
      retributions: this._formBuilder.array([], { validators: [uniqueRetributionValidator] }),
    });
  }

  public initCampaign(): void {
    this.campaignFormGroup.setValue(new CampaignUx());
  }

  public setTemplate(templateId: number | null = null): void {
    let campaign;

    if (templateId) {
      // get template from service
      this._campaignStoreService.templates$
        .pipe(
          takeUntil(this.destroy$),
          map((cas) => cas.find((ca) => ca._id === templateId)),
          // take(1),
        )
        .subscribe(
          (template) => {
            campaign = new Campaign({
              ...template,
              _id: null,
              parent_id: templateId,
            }).toFormValues();
            this.setCampaignToForm(campaign, true);
          },
          (err) => {
            this._toastr.error('Template not found !');
          },
        );
    } else {
      // new campaign from scratch with default values
      campaign = new CampaignUx();
      campaign.filters.rank = [TripRankEnum.A, TripRankEnum.B, TripRankEnum.C];
      this.setCampaignToForm(campaign, true);
    }
  }

  private setCampaignToForm(campaign: CampaignUx, isTemplate = false): void {
    // patch main
    this.campaignFormGroup.patchValue({
      parent_id: campaign.parent_id,
      status: isTemplate ? CampaignStatusEnum.DRAFT : campaign.status,
      name: campaign.name,
      description: campaign.description,
      start: isTemplate ? null : campaign.start,
      end: isTemplate ? null : campaign.end,
      max_trips: campaign.max_trips,
      max_amount: campaign.max_amount,
      unit: campaign.unit,
      only_adult: campaign.only_adult,
    });

    // patch rules
    const filtersForm = this.campaignFormGroup.get('filters');
    filtersForm.patchValue({
      weekday: campaign.filters.weekday,
      distance_range: campaign.filters.distance_range,
      rank: campaign.filters.rank,
      operator_ids: campaign.filters.operator_ids,
      all_operators: !campaign.filters.operator_ids || campaign.filters.operator_ids.length === 0,
    });

    // patch uiStatus
    const uiStatusForm = this.campaignFormGroup.get('ui_status');
    uiStatusForm.patchValue({
      for_driver: campaign.ui_status.for_driver,
      for_passenger: campaign.ui_status.for_passenger,
      for_trip: campaign.ui_status.for_trip,
      staggered: !!campaign.ui_status.staggered, // initialize staggered
      // initialize insee_mode
      insee_mode: campaign.ui_status.insee_mode || campaign.filters.insee.whiteList.length > 0,
    });

    // patch form arrays
    const timeFormArray = filtersForm.get('time') as FormArray;
    timeFormArray.clear();
    campaign.filters.time.forEach((time) => {
      timeFormArray.push(this._formBuilder.control(time));
    });

    // patch insee filter
    const blackListFormArray = filtersForm.get('insee').get('blackList') as FormArray;
    blackListFormArray.clear();
    campaign.filters.insee.blackList.forEach((insee) => {
      blackListFormArray.push(
        this._formBuilder.group({
          start: [insee.start],
          end: [insee.end],
        }),
      );
    });

    const whiteListFormArray = filtersForm.get('insee').get('whiteList') as FormArray;
    whiteListFormArray.clear();
    campaign.filters.insee.whiteList.forEach((insee) => {
      whiteListFormArray.push(
        this._formBuilder.group({
          start: [insee.start],
          end: [insee.end],
        }),
      );
    });

    // patch restriction
    const restrictionFormArray = this.campaignFormGroup.get('restrictions') as FormArray;
    restrictionFormArray.clear();
    campaign.restrictions.forEach((restriction) => {
      restrictionFormArray.push(this._formBuilder.group(restriction));
    });

    // patch retribution
    const retributionFormArray = this.campaignFormGroup.get('retributions') as FormArray;
    retributionFormArray.clear();
    if (campaign.retributions.length === 0) {
      // initialize retribution
      retributionFormArray.push(
        this._formBuilder.group({
          for_passenger: this._formBuilder.group({
            free: false,
            per_km: false,
            amount: null,
          }),
          for_driver: this._formBuilder.group({
            per_km: false,
            per_passenger: false,
            amount: null,
          }),
          min: null,
          max: null,
        }),
      );
    } else {
      campaign.retributions.forEach((retribution) => {
        retributionFormArray.push(
          this._formBuilder.group({
            for_passenger: this._formBuilder.group(retribution.for_passenger),
            for_driver: this._formBuilder.group(retribution.for_driver),
            min: retribution.min,
            max: retribution.max,
          }),
        );
      });
    }

    // set defaults
    const distanceRange = filtersForm.get('distance_range');
    if (
      !distanceRange.value ||
      distanceRange.value.length < 2 ||
      (distanceRange.value[0] === 0 && distanceRange.value[1] === 0)
    ) {
      distanceRange.setValue(this._defaultRange);
    }

    // manage stepper when all data is loaded
    this.matStepperCompleted = true;
    if (isTemplate) {
      this.loading = false;
      setTimeout(() => {
        this._matStepper.next();
      }, 0);
    } else if (this.section) {
      this.currentStep = this.section;
      this.loading = false;
    } else {
      this.setLastAvailableStep();
    }
  }

  private loadCampaign(campaignId: number, isDuplicate = false): void {
    this._campaignStoreService
      .getById(campaignId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (campaign: Campaign) => {
          if (isDuplicate) {
            this._campaignStoreService.selectNew();
          }
          this.setCampaignToForm(campaign.toFormValues(), isDuplicate);
        },
        (err) => {
          console.log('err : ', err);
          this._router.navigate(['/campaign']).then(() => {
            this._toastr.error("Les données de la campagne n'ont pas pu être chargées");
          });
        },
      );
  }

  private initCampaigns(): void {
    this._campaignStoreService.loadCampaigns();

    // if (!this._campaignStoreService.loaded) {
    // if (this._authService.user.group === UserGroupEnum.TERRITORY) {
    //   // this._campaignStoreService.filterSubject.next({ territory_id: this._authService.user.territory_id });
    //   this._campaignStoreService.filterSubject.next({ territory_id: this._authService.user.territory_id });
    // }
    // }
  }

  private setLastAvailableStep(): void {
    setTimeout(() => {
      // tslint:disable-next-line:prefer-conditional-expression
      if (this.canGoToLastStep) {
        this.currentStep = 3;
      } else if (this.canGoToThirdStep) {
        this.currentStep = 2;
      } else {
        this.currentStep = 1;
      }
      this.loading = false;
    }, 0);
  }
}
