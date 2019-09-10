import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { MatStepper } from '@angular/material';
import * as moment from 'moment';
import * as _ from 'lodash';
import { takeUntil } from 'rxjs/operators';

import { Campaign } from '~/core/entities/campaign/campaign';
import { CampaignService } from '~/modules/campaign/services/campaign.service';
import { CampaignStatusEnum } from '~/core/enums/campaign/campaign-status.enum';
import { IncentiveRules } from '~/core/entities/campaign/incentive-rules';
import { RulesRangeType } from '~/core/types/campaign/rulesRangeType';
import { restrictionEnum } from '~/core/enums/campaign/restrictions.enum';
import { DialogService } from '~/core/services/dialog.service';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { IncentiveUnitEnum } from '~/core/enums/campaign/incentive-unit.enum';

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

  private _defaultRange: RulesRangeType = [0, 150];
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
  }

  public get controls() {
    return this.campaignFormGroup.controls;
  }

  get showFirstPageNextStep() {
    return this.campaignFormGroup.controls.template_id.value || this.campaignFormGroup.controls._id.value;
  }

  saveOrLaunchCampaign(saveAsDraft) {
    const formatedCampaign = _.cloneDeep(this.campaignFormGroup.getRawValue());

    // format dates : moment --> Date
    formatedCampaign.start = formatedCampaign.start.toDate();
    formatedCampaign.end = formatedCampaign.end.toDate();

    const campaignToSave: Campaign = new Campaign(formatedCampaign);
    if (!saveAsDraft && campaignToSave.status === CampaignStatusEnum.DRAFT) {
      this.launchCampaign(campaignToSave);
    } else {
      this.saveCampaign(campaignToSave);
    }
  }

  get canGoToThirdStep(): boolean {
    const rulesFormGroup = this.campaignFormGroup.get('rules');
    return (
      rulesFormGroup.get('weekday').valid &&
      rulesFormGroup.get('range').valid &&
      rulesFormGroup.get('ranks').valid &&
      rulesFormGroup.get('operators').valid &&
      (rulesFormGroup.get('forDriver').value ||
        rulesFormGroup.get('forPassenger').value ||
        rulesFormGroup.get('forTrip').value)
    );
  }

  get canGoToLastStep(): boolean {
    return (
      this.campaignFormGroup.get('rules').valid &&
      this.campaignFormGroup.get('max_amount').valid &&
      this.campaignFormGroup.get('max_trips').valid &&
      this.campaignFormGroup.get('start').valid &&
      this.campaignFormGroup.get('end').valid &&
      this.campaignFormGroup.get('amount_unit').valid &&
      this.campaignFormGroup.get('restrictions').valid &&
      this.campaignFormGroup.get('formula_expression').valid &&
      this.campaignFormGroup.get('formulas').valid
    );
  }

  private launchCampaign(campaign: Campaign) {
    campaign.status = CampaignStatusEnum.VALIDATED;
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
          // tslint:disable-next-line:max-line-length
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
      rules: this._formBuilder.group({
        weekday: [null, Validators.required],
        time: this._formBuilder.array([]),
        range: [this._defaultRange, Validators.required],
        ranks: [null, Validators.required],
        onlyAdult: [],
        forDriver: [],
        forPassenger: [],
        forTrip: [],
        operators: [[], Validators.required],
      }),
      start: [null, Validators.required],
      end: [null, Validators.required],
      max_amount: [null, [Validators.required, Validators.min(1)]],
      amount_unit: [null, Validators.required],
      max_trips: [null, Validators.min(1)],
      template_id: [null],
      restrictions: this._formBuilder.array([]),
      formula_expression: ['', Validators.required],
      formulas: this._formBuilder.array([]),
      expertMode: [false],
    });
  }

  public initCampaign() {
    this.campaignFormGroup.setValue(new Campaign());
  }

  public setTemplate(templateId: string | null = null) {
    let campaign = new Campaign();
    if (templateId) {
      // get template from service
      campaign = {
        _id: null,
        ...this.campaignService.getLoadedTemplate(templateId),
      };
    }

    // load it
    this.setCampaignToForm(campaign, true);
  }

  private setCampaignToForm(campaign: Campaign, isTemplate = false) {
    // patch main
    this.campaignFormGroup.patchValue({
      _id: campaign._id,
      template_id: campaign.template_id,
      status: isTemplate ? CampaignStatusEnum.DRAFT : campaign.status,
      name: campaign.name,
      description: campaign.description,
      start: campaign.start,
      end: campaign.end,
      max_trips: campaign.max_trips,
      max_amount: campaign.max_amount,
      amount_unit: campaign.amount_unit,
      formula_expression: campaign.formula_expression,
      expertMode: campaign.expertMode,
    });

    // patch rules
    const rulesForm = this.campaignFormGroup.get('rules');
    rulesForm.patchValue({
      weekday: campaign.rules.weekday,
      range: campaign.rules.range,
      ranks: campaign.rules.ranks,
      onlyAdult: campaign.rules.onlyAdult,
      forDriver: campaign.rules.forDriver,
      forPassenger: campaign.rules.forPassenger,
      forTrip: campaign.rules.forTrip,
      operators: campaign.rules.operators,
    });

    // patch form arrays
    const timeFormArray = <FormArray>rulesForm.get('time');
    timeFormArray.clear();
    campaign.rules.time.forEach((time) => {
      timeFormArray.push(this._formBuilder.control(time));
    });

    const restrictionFormArray = <FormArray>this.campaignFormGroup.get('restrictions');
    restrictionFormArray.clear();
    campaign.restrictions.forEach((restriction) => {
      restrictionFormArray.push(this._formBuilder.group(restriction));
    });

    const formulaFormArray = <FormArray>this.campaignFormGroup.get('formulas');
    formulaFormArray.clear();
    campaign.formulas.forEach((formula) => {
      formulaFormArray.push(this._formBuilder.group(formula));
    });

    // set defaults
    if (
      !rulesForm.get('range').value ||
      rulesForm.get('range').value.length < 2 ||
      (rulesForm.get('range').value[0] === 0 && rulesForm.get('range').value[1] === 0)
    ) {
      rulesForm.get('range').setValue(this._defaultRange);
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
          this.setCampaignToForm(campaign, false);
        },
        () => {
          if (campaignId !== '5d6fa2995623dc991b288f11') {
            this.router.navigate(['/campaign']);
          }
          this.setCampaignToForm(
            new Campaign({
              _id: '5d6fa2995623dc991b288f11',
              template_id: null,
              status: CampaignStatusEnum.DRAFT,
              name: "Campagne d'incitation en idf",
              description: 'Délibération 2019/143',
              rules: <IncentiveRules>{
                weekday: [0, 1, 2, 3, 4, 5, 6],
                range: [2, 150],
                time: [],
                ranks: ['A', 'B', 'C'],
                onlyAdult: false,
                forDriver: false,
                forPassenger: false,
                forTrip: true,
                operators: [],
              },
              start: moment()
                .add(1, 'days')
                .toDate(),
              end: moment()
                .add(3, 'months')
                .toDate(),
              max_trips: null,
              max_amount: 2000000,
              amount_unit: IncentiveUnitEnum.EUR,
              restrictions: [
                {
                  quantity: 2,
                  is_driver: true,
                  period: restrictionEnum.DAY,
                },
              ],
              formula_expression:
                // tslint:disable-next-line:max-line-length
                '10c€ par passager par trajet avec un plancher de 1,5€ pour les trajets de moins de 15 km et un maximum de 3€ par passager ',
              formulas: [
                {
                  formula:
                    // tslint:disable-next-line:max-line-length
                    'smaller(distance/1000, 30)*0.1*pour_conducteur*(distance/1000)*nombre_passager + largerEq(distance/1000, 30)*3',
                },
                {
                  formula:
                    // tslint:disable-next-line:max-line-length
                    'smaller(distance/1000, 15)*(largerEq(incitation, 1.5)*(distance/1000)*1.5/somme_incitations_passager  + smaller(incitation, 1.5)*incitation) + largerEq(distance/1000, 15)*incitation',
                },
              ],
              expertMode: true,
            }),
          );
        },
      );
  }

  private setLastAvailableStep(): void {
    setTimeout(() => {
      // tslint:disable-next-line:prefer-conditional-expression
      if (this.campaignFormGroup.get('rules').valid) {
        this.currentStep = 2;
      } else {
        this.currentStep = 1;
      }
      this.loading = false;
    }, 0);
  }
}
