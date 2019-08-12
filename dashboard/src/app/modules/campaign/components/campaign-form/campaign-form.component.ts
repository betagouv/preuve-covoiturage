import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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

  constructor(private _formBuilder: FormBuilder) {}

  ngOnInit() {
    this.initForms();
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
    });
  }
}
