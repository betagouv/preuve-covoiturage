import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';

import { UtilsService } from '~/core/services/utils.service';
import { IncentiveUnitEnum } from '~/core/enums/campaign/incentive-unit.enum';
import { OperatorService } from '~/modules/operator/services/operator.service';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { CampaignStatusEnum } from '~/core/enums/campaign/campaign-status.enum';
import { CampaignUx } from '~/core/entities/campaign/ux-format/campaign-ux';
import { CampaignService } from '~/modules/campaign/services/campaign.service';

@Component({
  selector: 'app-summary-form',
  templateUrl: './summary-form.component.html',
  styleUrls: ['./summary-form.component.scss'],
})
export class SummaryFormComponent extends DestroyObservable implements OnInit {
  @Input() campaignForm: FormGroup;
  @Input() loading: boolean;
  @Output() onSaveCampaign: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    private currencyPipe: CurrencyPipe,
    public utils: UtilsService,
    private numberPipe: DecimalPipe,
    private operatorService: OperatorService,
    private toastr: ToastrService,
    private campaignService: CampaignService,
  ) {
    super();
  }

  ngOnInit() {}

  get controls() {
    return this.campaignForm.controls;
  }

  get retributionParametersControls() {
    const formGroup = <FormGroup>this.campaignForm.get('retributionParameters');
    return formGroup.controls;
  }

  getSummaryText(): string {
    const campaign: CampaignUx = this.campaignForm.getRawValue();

    const uiStatus = this.campaignForm.get('ui_status').value;

    const retributionText = this.campaignService.getExplanationFromRetributions(
      campaign.retributions,
      this.campaignForm.controls.unit.value,
      uiStatus,
    );

    let summaryText = `Campagne d’incitation au covoiturage du <b>`;

    // DATE
    summaryText += ` ${moment(campaign.start).format('dddd DD MMMM YYYY')} au`;
    summaryText += ` ${moment(campaign.end).format('dddd DD MMMM YYYY')}</b>, limitée à`;

    // MAXIMUM AMOUNT
    switch (this.campaignForm.controls.unit.value) {
      case IncentiveUnitEnum.EUR:
        summaryText += ` <b>${this.currencyPipe.transform(campaign.max_amount, 'EUR', 'symbol', '1.0-0')}</b>.`;
        break;
      case IncentiveUnitEnum.POINT:
        summaryText += ` <b>${this.numberPipe.transform(campaign.max_amount, '1.0-0', 'FR')} points</b>.`;
        break;
    }
    summaryText += '<br/><br/>\r\n\r\n';

    // TARGET
    summaryText += `Sont rémunérés les <b>`;
    summaryText += ` ${
      campaign.ui_status.for_driver && campaign.ui_status.for_passenger
        ? 'conducteurs et passagers'
        : campaign.ui_status.for_driver
        ? 'conducteurs'
        : 'passagers'
    }`;

    // ONLY ADULT
    summaryText += ` ${campaign.only_adult ? 'majeurs' : ''}</b>`;

    // DISTANCE
    summaryText += ` effectuant un trajet`;
    if (campaign.filters.distance_range[1] > 99) {
      summaryText += ` d'au moins ${campaign.filters.distance_range[0]} km`;
    } else if (campaign.filters.distance_range[0] < 1) {
      summaryText += ` d'au plus ${campaign.filters.distance_range[1]} km`;
    } else {
      summaryText += ` compris entre ${campaign.filters.distance_range[0]} à ${campaign.filters.distance_range[1]} km`;
    }
    summaryText += ` à raison de : `;

    // RETRIBUTION
    summaryText += '<br/><br/>\r\n\r\n';
    summaryText += `${retributionText}`;
    summaryText += '<br/><br/>\r\n\r\n';

    // RANKS
    summaryText += `L’opération est limitée aux opérateurs proposant des preuves de classe`;
    summaryText += ` <b>${campaign.filters.rank ? campaign.filters.rank.join(' ou ') : ''}</b>.`;
    summaryText += '<br/><br/>\r\n\r\n';

    // OPERATORS
    const nbOperators = campaign.filters.operator_ids ? campaign.filters.operator_ids.length : 0;
    if (nbOperators === this.operatorService.entities.length) {
      summaryText += `La campagne est accessible à tous les opérateurs présents sur le registre (${nbOperators}).`;
    } else {
      summaryText += `La campagne est limitée à ${nbOperators} opérateur(s) présent(s) sur le registre.`;
    }
    // todo: fix this part
    // const restrictions = <FormArray>this.controls.restrictions;
    // if (restrictions.length > 0) {
    //   // tslint:disable-next-line:max-line-length
    //   const restrictionsWho: string[] = [
    //     ...new Set(
    //       restrictions.controls.map((formControl: FormControl) => {
    //         if (formControl.value && formControl.value.who) {
    //           switch (formControl.value.who) {
    //             case 'driver':
    //               return 'conducteurs';
    //             case 'passenger':
    //               return 'passagers';
    //             case 'operator':
    //               return 'opérateurs';
    //           }
    //         }
    //       }),
    //     ),
    //   ];
    //   summaryText += ` Des restrictions concernant les ${restrictionsWho.join(', ')} seront appliqué.`;
    // } else {
    //   summaryText += ` Aucune restriction concernant les conducteurs, passagers ou opérateurs n'est appliquée.`;
    // }
    return summaryText;
  }

  copySummary(summary: string): void {
    this.utils.copyToClipboard(summary);
    this.toastr.success('Le récapitulatif a été copié !');
  }

  saveCampaign(isTemplate: boolean) {
    if (isTemplate) {
      this.controls.status.setValue(CampaignStatusEnum.TEMPLATE);
    }
    this.onSaveCampaign.emit();
  }
}
