import { Component, OnInit } from '@angular/core';

import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/api';

import { IncentivePolicy } from '~/entities/database/Incentive/incentivePolicy';

@Component({
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})
export class IncentivePolicyConfirmationComponent implements OnInit {
  public policy: IncentivePolicy;

  constructor(public ref: DynamicDialogRef, public config: DynamicDialogConfig) {}

  ngOnInit(): void {
    const { policy } = this.config.data;
    this.policy = policy;
  }

  onSubmit() {
    this.ref.close({
      confirm: true,
    });
  }
}
