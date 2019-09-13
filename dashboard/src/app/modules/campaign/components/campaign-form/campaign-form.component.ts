import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { MatStepper } from '@angular/material';
import * as moment from 'moment';
import * as _ from 'lodash';
import { takeUntil } from 'rxjs/operators';

import { CampaignService } from '~/modules/campaign/services/campaign.service';
import { CampaignStatusEnum } from '~/core/enums/campaign/campaign-status.enum';
import { RulesRangeUxType } from '~/core/types/campaign/rulesRangeInterface';
import { restrictionEnum } from '~/core/enums/campaign/restrictions.enum';
import { DialogService } from '~/core/services/dialog.service';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { IncentiveUnitEnum } from '~/core/enums/campaign/incentive-unit.enum';
import { Campaign } from '~/core/entities/campaign/campaign';
import { CampaignUx } from '~/core/entities/campaign/campaign-ux';
import { TripRankEnum } from '~/core/enums/trip/trip-rank.enum';

@Component({
  selector: 'app-campaign-form',
  templateUrl: './campaign-form.component.html',
  styleUrls: ['./campaign-form.component.scss'],
})
export class CampaignFormComponent extends DestroyObservable implements OnInit {
  helpCard = {
    svgIcon: 'new_car',
    title: 'Vous êtes nouveau sur Preuve de covoiturage ?',
    hint: 'Découvrez comment développer une politique de covoiturage efficace dans votre collectivité',
    link: 'https://registre-preuve-de-covoiturage.gitbook.io/produit/boite-a-outils/guide-des-incitations',
  };
  campaignFormGroup: FormGroup;
  requestLoading = false;
  loading = true;
  creation = false;
  currentStep = 0;
  matStepperCompleted = false;

  private _defaultRange: RulesRangeUxType = [0, 150];
  @ViewChild('stepper', { static: false }) _matStepper: MatStepper;

  constructor(
    private _dialog: DialogService,
    private _formBuilder: FormBuilder,
    private campaignService: CampaignService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    super();
  }

  ngOnInit() {
    this.initForms();
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params: ParamMap) => {
      this.creation = !params.has('campaignId');
      if (this.creation) {
        this.loading = false;
      } else {
        this.loadCampaign(params.get('campaignId'));
      }
    });
    this.campaignFormGroup.valueChanges.subscribe((val) => console.log(this.campaignFormGroup));
  }

  public get controls() {
    return this.campaignFormGroup.controls;
  }

  get showFirstPageNextStep() {
    return this.campaignFormGroup.controls.parent_id.value || this.campaignFormGroup.controls._id.value;
  }

  saveOrLaunchCampaign(saveAsDraft) {
    const campaign = _.cloneDeep(this.campaignFormGroup.getRawValue());
    const campaignToSave: Campaign = this.campaignService.toCampaignFormat(campaign);
    if (!saveAsDraft && campaignToSave.status === CampaignStatusEnum.DRAFT) {
      this.launchCampaign(campaignToSave);
    } else {
      this.saveCampaign(campaignToSave);
    }
  }

  get canGoToThirdStep(): boolean {
    const filtersFormGroup = this.campaignFormGroup.get('filters');
    return (
      filtersFormGroup.get('weekday').valid &&
      filtersFormGroup.get('distance_range').valid &&
      filtersFormGroup.get('rank').valid &&
      filtersFormGroup.get('operator_ids').valid &&
      this.campaignFormGroup.get('ui_status').valid &&
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

  private launchCampaign(campaign: Campaign) {
    campaign.status = CampaignStatusEnum.PENDING;
    this._dialog
      .confirm('Lancement de la campagne', 'Êtes-vous sûr de vouloir lancer la campagne ?', 'Confirmer')
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          this.campaignService
            .create(campaign)
            .pipe(takeUntil(this.destroy$))
            .subscribe(
              (campaignSaved: Campaign) => {
                this.requestLoading = false;
                // tslint:disable-next-line:max-line-length
                this.toastr.success(`La campagne ${campaignSaved.name} a bien été lancé`);
                this.router.navigate(['/campaign']);
              },
              (error) => {
                this.requestLoading = false;
                console.error(error);
                this.toastr.error('Une erreur est survenue lors du lancement de la campagne');
              },
            );
        }
      });
  }

  private saveCampaign(campaign: Campaign) {
    this.campaignService
      .create(campaign)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (campaignSaved: Campaign) => {
          this.requestLoading = false;
          this.toastr.success(`La campagne ${campaignSaved.name} a bien été enregistré`);
          this.router.navigate(['/campaign']);
        },
        (error) => {
          this.requestLoading = false;
          console.error(error);
          this.toastr.error("Une erreur est survenue lors de l'enregistrement de la campagne");
        },
      );
  }

  private initForms() {
    this.campaignFormGroup = this._formBuilder.group({
      _id: [null],
      name: [null, Validators.required],
      description: [null],
      status: [],
      filters: this._formBuilder.group({
        weekday: [null, Validators.required],
        time: this._formBuilder.array([]),
        distance_range: [this._defaultRange, Validators.required],
        rank: [null, Validators.required],
        operator_ids: [[], Validators.required],
      }),
      only_adult: [null],
      ui_status: this._formBuilder.group({
        for_driver: [null],
        for_passenger: [null],
        for_trip: [null],
      }),
      start: [null, Validators.required],
      end: [null, Validators.required],
      max_amount: [null, [Validators.required, Validators.min(1)]],
      unit: [null, Validators.required],
      max_trips: [null, Validators.min(1)],
      parent_id: [null],
      restrictions: this._formBuilder.array([]),
      retributions: this._formBuilder.array([]),
    });
  }

  public initCampaign() {
    this.campaignFormGroup.setValue(new CampaignUx());
  }

  public setTemplate(templateId: string | null = null) {
    let campaign = new CampaignUx();

    if (templateId) {
      // get template from service
      campaign = this.campaignService.toCampaignUxFormat({
        ...this.campaignService.getLoadedTemplate(templateId),
        _id: null,
        parent_id: templateId,
      });
    }

    // load it
    this.setCampaignToForm(campaign, true);
  }

  private setCampaignToForm(campaign: CampaignUx, isTemplate = false) {
    // patch main
    this.campaignFormGroup.patchValue({
      _id: campaign._id,
      parent_id: campaign.parent_id,
      status: isTemplate ? CampaignStatusEnum.DRAFT : campaign.status,
      name: campaign.name,
      description: campaign.description,
      start: campaign.start,
      end: campaign.end,
      max_trips: campaign.max_trips,
      max_amount: campaign.max_amount,
      unit: campaign.unit,
    });

    // patch rules
    const filtersForm = this.campaignFormGroup.get('filters');
    filtersForm.patchValue({
      weekday: campaign.filters.weekday,
      distance_range: campaign.filters.distance_range,
      ranks: campaign.filters.rank,
      operator_ids: campaign.filters.operator_ids,
    });

    // patch form arrays
    const timeFormArray = <FormArray>filtersForm.get('time');
    timeFormArray.clear();
    campaign.filters.time.forEach((time) => {
      timeFormArray.push(this._formBuilder.control(time));
    });

    const restrictionFormArray = <FormArray>this.campaignFormGroup.get('restrictions');
    restrictionFormArray.clear();
    campaign.retributions.forEach((restriction) => {
      restrictionFormArray.push(this._formBuilder.group(restriction));
    });

    // const formulaFormArray = <FormArray>this.campaignFormGroup.get('formulas');
    // formulaFormArray.clear();
    // campaign.formulas.forEach((formula) => {
    //   formulaFormArray.push(this._formBuilder.group(formula));
    // });

    // set defaults
    const distanceRange = filtersForm.get('distance_range');
    if (
      !distanceRange.value ||
      distanceRange.value.length < 2 ||
      (distanceRange.value[0] === 0 && distanceRange.value[1] === 0)
    ) {
      distanceRange.setValue(this._defaultRange);
    }

    this.matStepperCompleted = true;

    if (isTemplate) {
      setTimeout(() => {
        this._matStepper.next();
      }, 0);
    } else {
      this.setLastAvailableStep();
    }
  }

  private loadCampaign(campaignId: string) {
    this.campaignService
      .get(campaignId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (campaign: Campaign) => {
          const campaignUx = this.campaignService.toCampaignUxFormat(campaign);
          this.setCampaignToForm(campaignUx, false);
        },
        () => {
          if (campaignId !== '5d6fa2995623dc991b288f11') {
            this.router.navigate(['/campaign']);
          }
          this.setCampaignToForm(
            new CampaignUx({
              _id: '5d6fa2995623dc991b288f11',
              parent_id: null,
              status: CampaignStatusEnum.DRAFT,
              name: "Campagne d'incitation en idf",
              description: 'Délibération 2019/143',
              filters: {
                weekday: [0, 1, 2, 3, 4, 5, 6],
                distance_range: [2, 150],
                time: [],
                rank: [TripRankEnum.A, TripRankEnum.B, TripRankEnum.C],
                operator_ids: [],
              },
              only_adult: false,
              ui_status: {
                for_driver: false,
                for_passenger: false,
                for_trip: true,
              },
              start: moment().add(1, 'days'),
              end: moment().add(3, 'months'),
              max_trips: null,
              max_amount: 2000000,
              unit: IncentiveUnitEnum.EUR,
              restrictions: [
                {
                  quantity: 2,
                  is_driver: true,
                  period: restrictionEnum.DAY,
                },
              ],
              retributions: [],
            }),
          );
        },
      );
  }

  private setLastAvailableStep(): void {
    setTimeout(() => {
      // tslint:disable-next-line:prefer-conditional-expression
      if (this.canGoToThirdStep) {
        this.currentStep = 2;
      } else {
        this.currentStep = 1;
      }
      this.loading = false;
    }, 0);
  }
}
