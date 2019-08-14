import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Campaign } from '~/core/entities/campaign/campaign';
import { CampaignService } from '~/modules/campaign/services/campaign.service';
import { ToastrService } from 'ngx-toastr';
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

  constructor(
    private _formBuilder: FormBuilder,
    private campaignService: CampaignService,
    private toastr: ToastrService,
  ) {}

  ngOnInit() {
    this.initForms();
  }

  setCampaignTemplate() {
    const template: Campaign = this.templateFormGroup.get('templateCtrl').value;
    if (!template) {
      return;
    }
    this.campaignFormGroup.get('name').setValue(template.name);
    const rulesForm = this.campaignFormGroup.get('rules');
    rulesForm.get('weekday').setValue(template.rules.weekday);
    if (template.rules.range) {
      rulesForm.get('range').setValue([template.rules.range.min, template.rules.range.max]);
    }
    rulesForm.get('ranks').setValue(template.rules.ranks);
    rulesForm.get('onlyMajorPeople').setValue(template.rules.onlyMajorPeople);
    rulesForm.get('forDriver').setValue(template.rules.forDriver);
    rulesForm.get('forPassenger').setValue(template.rules.forPassenger);
    template.rules.time.forEach((time) => {
      const timeFormArray = <FormArray>rulesForm.get('time');
      timeFormArray.push(this._formBuilder.control(time, Validators.required));
    });
  }

  saveCampaign(isDraft) {
    const campaignToSave: Campaign = new Campaign(this.campaignFormGroup.getRawValue());
    if (!isDraft && campaignToSave.status === CampaignStatus.DRAFT) {
      campaignToSave.status = CampaignStatus.VALIDATED;
    }
    this.campaignService.create(this.campaignFormGroup.getRawValue()).subscribe(
      (campaignSaved: Campaign) => {
        this.toastr.success(`La campagne ${campaignSaved.name} a bien été enregistrée`);
      },
      (error) => {
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
      rules: [],
      start: [null, Validators.required],
      end: [null, Validators.required],
      max_amount: [null, [Validators.required, Validators.min(1)]],
      max_trips: [null, [Validators.required, Validators.min(1)]],
      name: [null, Validators.required],
      description: [null],
      incentiveMode: [],
      saveAsTemplate: [],
    });
  }
}
