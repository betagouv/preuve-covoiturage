import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { MatStepper } from '@angular/material';
import * as moment from 'moment';

import { Campaign } from '~/core/entities/campaign/campaign';
import { CampaignService } from '~/modules/campaign/services/campaign.service';
import { CampaignStatus } from '~/core/entities/campaign/campaign-status';
import { IncentiveRules } from '~/core/entities/campaign/incentive-rules';
import { IncentiveUnit } from '~/core/entities/campaign/IncentiveUnit';
import { RulesRangeType } from '~/core/types/campaign/rulesRangeType';
import { restrictionEnum } from '~/core/enums/campaign/restrictions.enum';

@Component({
  selector: 'app-campaign-form',
  templateUrl: './campaign-form.component.html',
  styleUrls: ['./campaign-form.component.scss'],
})
export class CampaignFormComponent implements OnInit {
  helpCard = {
    svgIcon: 'new_car',
    title: 'Vous êtes nouveau sur Preuve de covoiturage ?',
    hint: 'Découvrez comment développer une politique de covoiturage efficace dans votre collectivité',
    link: 'https://registre-preuve-de-covoiturage.gitbook.io/produit/boite-a-outils/guide-des-incitations',
  };
  campaignFormGroup: FormGroup;
  requestLoading = false;
  loading = true;
  private _defaultRange: RulesRangeType = [0, 50];
  currentStep = 0;

  matStepperCompleted = false;
  @ViewChild('stepper', { static: false }) _matStepper: MatStepper;

  constructor(
    private _formBuilder: FormBuilder,
    private campaignService: CampaignService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.initForms();
    this.route.paramMap.subscribe((params: ParamMap) => {
      // todo: go to last accessible step
      if (params.has('campaignId')) {
        this.loadCampaign(params.get('campaignId'));
      } else {
        this.loading = false;
      }
    });
    this.campaignFormGroup.valueChanges.subscribe((val) => console.log(this.campaignFormGroup));
  }

  public get controls() {
    return this.campaignFormGroup.controls;
  }

  saveCampaign(isDraft) {
    this.requestLoading = true;
    const campaignToSave: Campaign = new Campaign(this.campaignFormGroup.getRawValue());
    if (!isDraft && campaignToSave.status === CampaignStatus.DRAFT) {
      campaignToSave.status = CampaignStatus.VALIDATED;
    }
    this.campaignService.create(campaignToSave).subscribe(
      (campaignSaved: Campaign) => {
        this.requestLoading = false;
        this.toastr.success(`La campagne ${campaignSaved.name} a bien été enregistrée`);
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
        operators: [],
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
      status: isTemplate ? campaign.status : CampaignStatus.DRAFT,
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
    if (!rulesForm.get('ranks').value || rulesForm.get('ranks').value.length < 2) {
      rulesForm.get('ranks').setValue(this._defaultRange);
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
    this.campaignService.get(campaignId).subscribe(
      (campaign: Campaign) => {
        // todo: if not found --> 404
        this.setCampaignToForm(campaign, false);
        // get step according to data filled
      },
      () => {
        this.setCampaignToForm(
          new Campaign({
            _id: '5d6e4e5e26251e6c9d1156df',
            template_id: null,
            status: CampaignStatus.DRAFT,
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
            amount_unit: IncentiveUnit.EUR,
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
      if (this.campaignFormGroup.get('rules').valid) {
        this.currentStep = 2;
      } else {
        this.currentStep = 1;
      }
      this.loading = false;
    }, 0);
  }
}
