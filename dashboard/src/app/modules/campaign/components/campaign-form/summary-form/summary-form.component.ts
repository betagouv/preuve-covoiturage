import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
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
  @Input() loading: boolean;
  @Output() onSaveCampaign: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private currencyPipe: CurrencyPipe, public utils: UtilsService) {}

  ngOnInit() {}

  get controls() {
    return this.campaignForm.controls;
  }

  getSummaryText(): string {
    const campaign: Campaign = this.campaignForm.getRawValue();
    let summaryText = `Campagne d’incitation au covoiturage du <b>${campaign.start} au`;
    summaryText += ` ${campaign.end}</b>, limitée à`;
    summaryText += ` <b>${this.currencyPipe.transform(campaign.max_amount, 'EUR', 'symbol', '1.0-0')}</b>.`;
    summaryText += '<br/><br/>\r\n\r\n';
    summaryText += `Sont rémunérés les <b>`;
    summaryText += ` ${
      campaign.rules.forDriver && campaign.rules.forPassenger
        ? 'conducteurs et passagers'
        : campaign.rules.forDriver
        ? 'conducteurs'
        : 'passagers'
    }`;
    summaryText += ` ${campaign.rules.onlyMajorPeople ? 'majeurs' : ''}</b>`;
    summaryText += ` à raison de <b>0,1€ par km et par passager</b>.`;
    summaryText += '<br/><br/>\r\n\r\n';
    summaryText += `L’opération est limitée aux opérateurs proposant des registres de preuve`;
    summaryText += ` <b>${campaign.rules.ranks ? campaign.rules.ranks.join(' ou ') : ''}</b>.`;
    return summaryText;
  }

  saveCampaign(isDraft: boolean = false) {
    this.onSaveCampaign.emit(isDraft);
  }

  saveAsTemplateChange($event) {
    if ($event.checked) {
      this.controls.description.setValidators(Validators.required);
    } else {
      this.controls.description.setValue(null);
      this.controls.description.setValidators(null);
    }
    this.controls.description.updateValueAndValidity();
  }
}
