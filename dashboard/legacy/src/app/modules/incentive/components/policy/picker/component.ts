import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, AbstractControl } from '@angular/forms';

import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/api';

import { ApiResponse } from '~/entities/responses/apiResponse';
import { IncentivePolicy } from '~/entities/database/Incentive/incentivePolicy';

import { IncentivePolicyService } from '../../../services/incentivePolicyService';

@Component({
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})
export class IncentivePolicyPickerComponent implements OnInit {
  public loading = false;
  public availablePolicies = [];
  public _policySearch = '';
  public filteredPolicies = [];

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private incentivePolicyService: IncentivePolicyService,
  ) {}

  ngOnInit(): void {
    this.getPolicies();
  }

  public getPolicies() {
    this.loading = true;
    this.incentivePolicyService.get().subscribe((response: ApiResponse) => {
      this.availablePolicies = response.data;
      this.loading = false;
      this.filter();
    });
  }

  get policySearch() {
    return this._policySearch;
  }

  set policySearch(value) {
    this._policySearch = value;
    this.filter();
  }

  filter() {
    try {
      const regexp = new RegExp(this.policySearch, 'g');
      this.filteredPolicies = this.availablePolicies.filter((policy) => regexp.test(policy.name));
    } catch (e) {
      this.filteredPolicies = [];
    }
  }

  onSubmit(policy) {
    this.ref.close(policy);
  }
}
