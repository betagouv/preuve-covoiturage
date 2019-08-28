import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import * as moment from 'moment';

import { UtilsService } from '~/core/services/utils.service';
import { Campaign } from '~/core/entities/campaign/campaign';
import { IncentiveUnit, IncentiveUnitFr } from '~/core/entities/campaign/Incentive-unit';
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

  get retributionParametersControls() {
    const formGroup = <FormGroup>this.campaignForm.get('retributionParameters');
    return formGroup.controls;
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
    const retributions = <FormArray>this.campaignForm.controls.retributions;
    const conductorProportionalPassengers = this.retributionParametersControls.conductorProportionalPassengers.value;
    for (const retribution of retributions.controls) {
      const retributionFormGroup: FormGroup = <FormGroup>retribution;
      const valueForDriver = retributionFormGroup.controls.valueForDriver.value;
      const valueForPassenger = retributionFormGroup.controls.valueForPassenger.value;
      const start = retributionFormGroup.controls.start.value;
      const end = retributionFormGroup.controls.end.value;
      summaryText += `<br/>\r\n<b>- `;
      if (valueForDriver !== null) {
        // tslint:disable-next-line:max-line-length
        summaryText += `${valueForDriver} ${IncentiveUnitFr[this.controls.amount_unit.value]} par ${
          this.controls.incentiveMode.value === 'per_trip' ? 'trajet' : 'km'
        }`;
        summaryText += conductorProportionalPassengers ? ' par passager' : '';
        summaryText += ' pour le conducteur';
      }
      summaryText += valueForDriver !== null && valueForPassenger !== null ? ', ' : '';
      if (valueForPassenger !== null) {
        // tslint:disable-next-line:max-line-length
        summaryText += `${valueForPassenger} ${IncentiveUnitFr[this.controls.amount_unit.value]} par ${
          this.controls.incentiveMode.value === 'per_trip' ? 'trajet' : 'km'
        } pour le(s) passager(s)`;
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
