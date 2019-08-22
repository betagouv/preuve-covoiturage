import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import * as moment from 'moment';

import { UtilsService } from '~/core/services/utils.service';
import { Campaign } from '~/core/entities/campaign/campaign';
import { IncentiveUnit } from '~/core/entities/campaign/IncentiveUnit';
import { OperatorService } from '~/modules/operator/services/operator.service';

@Component({
  selector: 'app-summary-form',
  templateUrl: './summary-form.component.html',
  styleUrls: ['./summary-form.component.scss'],
})
export class SummaryFormComponent implements OnInit {
  @Input() campaignForm: FormGroup;
  @Input() loading: boolean;
  @Output() onSaveCampaign: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    private currencyPipe: CurrencyPipe,
    public utils: UtilsService,
    private numberPipe: DecimalPipe,
    private operatorService: OperatorService,
  ) {}

  ngOnInit() {}

  get controls() {
    return this.campaignForm.controls;
  }

  getSummaryText(): string {
    const campaign: Campaign = this.campaignForm.getRawValue();
    let summaryText = `Campagne d’incitation au covoiturage du <b>`;
    summaryText += ` ${moment(campaign.start).format('dddd DD MMMM YYYY')} au`;
    summaryText += ` ${moment(campaign.end).format('dddd DD MMMM YYYY')}</b>, limitée à`;
    switch (this.campaignForm.controls.amount_unit.value) {
      case IncentiveUnit.EUR:
        summaryText += ` <b>${this.currencyPipe.transform(campaign.max_amount, 'EUR', 'symbol', '1.0-0')}</b>.`;
        break;
      case IncentiveUnit.POINT:
        summaryText += ` <b>${this.numberPipe.transform(campaign.max_amount, '1.0-0', 'FR')} points</b>.`;
        break;
    }
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
    summaryText += ` effectuant un trajet`;
    if (campaign.rules.range[1] > 99) {
      summaryText += ` d'au moins ${campaign.rules.range[0]} km`;
    } else if (campaign.rules.range[0] < 1) {
      summaryText += ` d'au plus ${campaign.rules.range[1]} km`;
    } else {
      summaryText += ` compris entre ${campaign.rules.range[0]} à ${campaign.rules.range[1]} km`;
    }
    summaryText += ` à raison de:`;
    const parameters = <FormArray>this.campaignForm.controls.parameters;
    for (const param of parameters.controls) {
      const paramFormGroup: FormGroup = <FormGroup>param;
      const valueForDriver = paramFormGroup.controls.valueForDriver.value;
      const valueForPassenger = paramFormGroup.controls.valueForPassenger.value;
      const start = paramFormGroup.controls.start.value;
      const end = paramFormGroup.controls.end.value;
      summaryText += `<br/>\r\n<b>- `;
      if (valueForDriver !== null) {
        // tslint:disable-next-line:max-line-length
        summaryText += `${valueForDriver} ${Campaign.getIncentiveUnitLabel(this.controls.amount_unit.value)} par ${
          this.controls.incentiveMode.value === 'per_trip' ? 'trajet' : 'km'
        } par conducteur`;
      }
      summaryText += valueForDriver !== null && valueForPassenger !== null ? ', ' : '';
      if (valueForPassenger !== null) {
        // tslint:disable-next-line:max-line-length
        summaryText += `${valueForPassenger} ${Campaign.getIncentiveUnitLabel(this.controls.amount_unit.value)} par ${
          this.controls.incentiveMode.value === 'per_trip' ? 'trajet' : 'km'
        } par passager`;
      }
      if (start || end) {
        if (!end) {
          summaryText += ` à partir de ${start} km`;
        } else {
          summaryText += ` de ${start} à ${end} km`;
        }
      }
      summaryText += `</b>.`;
    }
    summaryText += '<br/><br/>\r\n\r\n';
    summaryText += `L’opération est limitée aux opérateurs proposant des registres de preuve`;
    summaryText += ` <b>${campaign.rules.ranks ? campaign.rules.ranks.join(' ou ') : ''}</b>.`;
    const rules = <FormGroup>this.controls.rules;
    summaryText += '<br/><br/>\r\n\r\n';
    const nbOperators = rules.controls.operators.value ? rules.controls.operators.value.length : 0;
    if (nbOperators === this.operatorService.entities.length) {
      summaryText += `La campagne est accessible à tout les opérateurs présents sur le registre (${nbOperators}).`;
    } else {
      summaryText += `La campagne est limitée à ${nbOperators} présents sur le registre.`;
    }
    const restrictions = <FormArray>this.controls.restrictions;
    if (restrictions.length > 0) {
      // tslint:disable-next-line:max-line-length
      const restrictionsWho: string[] = [
        ...new Set(
          restrictions.controls.map((formControl: FormControl) => {
            if (formControl.value && formControl.value.who) {
              switch (formControl.value.who) {
                case 'driver':
                  return 'conducteurs';
                case 'passenger':
                  return 'passagers';
                case 'operator':
                  return 'opérateurs';
              }
            }
          }),
        ),
      ];
      summaryText += ` Des restrictions concernant les ${restrictionsWho.join(', ')} seront appliqué.`;
    } else {
      summaryText += ` Aucune restriction concernant les conducteurs, passagers ou opérateurs n'est appliquée.`;
    }
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
