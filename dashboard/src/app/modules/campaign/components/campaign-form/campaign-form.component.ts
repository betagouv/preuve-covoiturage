import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import * as moment from 'moment';

import { Campaign } from '~/core/entities/campaign/campaign';
import { CampaignService } from '~/modules/campaign/services/campaign.service';
import { CampaignStatus } from '~/core/entities/campaign/campaign-status';

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
  templateFormGroup: FormGroup;
  campaignFormGroup: FormGroup;
  loading = false;

  constructor(
    private _formBuilder: FormBuilder,
    private campaignService: CampaignService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.initForms();
    this.route.params.pipe(filter((p) => p.campaignId)).subscribe((params) => {
      this.loadCampaign(params.campaignId);
    });
  }

  setCampaignTemplate() {
    const template: Campaign = this.templateFormGroup.get('templateCtrl').value;
    if (!template) {
      return;
    }
    this.setCampaignToForm(template, true);
  }

  saveCampaign(isDraft) {
    this.loading = true;
    const campaignToSave: Campaign = new Campaign(this.campaignFormGroup.getRawValue());
    if (!isDraft && campaignToSave.status === CampaignStatus.DRAFT) {
      campaignToSave.status = CampaignStatus.VALIDATED;
    }
    this.campaignService.create(this.campaignFormGroup.getRawValue()).subscribe(
      (campaignSaved: Campaign) => {
        this.loading = false;
        this.toastr.success(`La campagne ${campaignSaved.name} a bien été enregistrée`);
        this.router.navigate(['/campaign']);
      },
      (error) => {
        this.loading = false;
        console.error(error);
        this.toastr.error("Une erreur est survenue lors de l'enregistrement de la campagne");
      },
    );
  }

  private initForms() {
    this.templateFormGroup = this._formBuilder.group({
      templateCtrl: [null, Validators.required],
    });

    this.campaignFormGroup = this._formBuilder.group({
      _id: [],
      status: [],
      rules: [],
      start: [null, Validators.required],
      end: [null, Validators.required],
      max_amount: [null, [Validators.required, Validators.min(1)]],
      amount_unit: [null, Validators.required],
      max_trips: [null, Validators.min(1)],
      name: [null, Validators.required],
      description: [null],
      incentiveMode: [null, Validators.required],
      saveAsTemplate: [],
      restrictions: this._formBuilder.array([]),
      retributionParameters: [],
      retributions: this._formBuilder.array([]),
    });
  }

  private setCampaignToForm(campaign, isTemplate = false) {
    if (!isTemplate) {
      this.campaignFormGroup.get('_id').setValue(campaign._id);
      this.campaignFormGroup.get('description').setValue(campaign.description);
      this.campaignFormGroup.get('status').setValue(campaign.status);
    }
    this.campaignFormGroup.get('name').setValue(campaign.name);
    const rulesForm = this.campaignFormGroup.get('rules');
    rulesForm.get('weekday').setValue(campaign.rules.weekday);
    if (campaign.rules.range) {
      rulesForm.get('range').setValue([campaign.rules.range.min, campaign.rules.range.max]);
    }
    rulesForm.get('ranks').setValue(campaign.rules.ranks);
    rulesForm.get('onlyMajorPeople').setValue(campaign.rules.onlyMajorPeople);
    rulesForm.get('forDriver').setValue(campaign.rules.forDriver);
    rulesForm.get('forPassenger').setValue(campaign.rules.forPassenger);
    campaign.rules.time.forEach((time) => {
      const timeFormArray = <FormArray>rulesForm.get('time');
      timeFormArray.push(this._formBuilder.control(time, Validators.required));
    });
  }

  private loadCampaign(campaignId) {
    this.campaignService.get(campaignId).subscribe((campaign: Campaign) => {
      this.setCampaignToForm(campaign);
    });
  }
}
