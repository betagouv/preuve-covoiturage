import { Component, OnInit, Input } from '@angular/core';

import { IncentivePolicy } from '~/entities/database/Incentive/incentivePolicy';

import { IncentiveFilterService } from '../../../services/incentiveFilterService';

@Component({
  selector: 'app-incentive-policy-summary',
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})
export class IncentivePolicySummaryComponent implements OnInit {
  @Input() incentivePolicy: IncentivePolicy;

  public incentiveFiltersList: any[];

  constructor(private incentiveFilterService: IncentiveFilterService) {
    //
  }

  ngOnInit() {
    this.incentiveFiltersList = this.incentiveFilterService.get();
  }

  get incentiveUnit() {
    return this.incentivePolicy.unit || { name: 'Non défini' };
  }

  get incentiveParameters() {
    return this.incentivePolicy.parameters || [];
  }

  get incentiveFilters() {
    return Reflect.ownKeys(this.incentivePolicy.rules)
      .map((ruleKey) => this.incentiveFiltersList.find((filter) => filter.key === ruleKey))
      .filter((rule) => this.incentivePolicy.rules[rule.key] !== null)
      .map((rule) => rule.toString(this.incentivePolicy.rules[rule.key]));
  }
}
