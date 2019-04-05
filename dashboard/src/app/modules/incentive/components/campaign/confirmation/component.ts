import { Component, OnInit } from '@angular/core';

import {
  DynamicDialogRef,
  DynamicDialogConfig,
} from 'primeng/api';

import { IncentiveCampaign } from '~/entities/database/Incentive/incentiveCampaign';

@Component({
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})

export class IncentiveCampaignConfirmationComponent implements OnInit {
  public campaign: IncentiveCampaign;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
  ) {
  }

  ngOnInit(): void {
    const { campaign } = this.config.data;
    this.campaign = campaign;
  }

  onSubmit() {
    this.ref.close({
      confirm: true,
    });
  }

  toLocaleDateString(el) {
    const d = new Date(el);
    return d.toLocaleDateString('fr-FR');
  }
}
