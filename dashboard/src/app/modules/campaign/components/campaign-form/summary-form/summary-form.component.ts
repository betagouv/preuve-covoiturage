import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';

import { UtilsService } from '~/core/services/utils.service';
import { Campaign } from '~/core/entities/campaign/campaign';

@Component({
  selector: 'app-summary-form',
  templateUrl: './summary-form.component.html',
  styleUrls: ['./summary-form.component.scss'],
})
export class SummaryFormComponent implements OnInit {
  @Input() campaignForm: FormGroup;

  constructor(private currencyPipe: CurrencyPipe, public utils: UtilsService) {}

  ngOnInit() {}

  get controls() {
    return this.campaignForm.controls;
  }

  getSummaryText(): string {
    const campaign: Campaign = this.campaignForm.value;
    let summaryText = `Campagne d’incitation au covoiturage du <b>${campaign.start} au
    ${campaign.end}</b>, limitée à
    <b>${this.currencyPipe.transform(campaign.max_amount, 'EUR', 'symbol', '1.0-0')}</b>.`;
    summaryText += '<br/><br/>';
    summaryText += `Sont rémunérés les <b>${
      campaign.rules.forDriver && campaign.rules.forPassenger
        ? 'conducteurs et passagers'
        : campaign.rules.forDriver
        ? 'conducteurs'
        : 'passagers'
    }
      ${campaign.rules.onlyMajorPeople ? 'majeurs' : ''}</b> à raison de`;
    return summaryText;
  }

  saveCampaign(isDraft: boolean = false) {
    console.log('Poulet');
  }
}
