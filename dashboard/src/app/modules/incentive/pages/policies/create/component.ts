import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import {
  MenuItem,
} from 'primeng/api';
import { Router } from '@angular/router';

import { IncentivePolicyService } from '../../../services/incentivePolicyService';
import { environment } from '../../../../../../environments/environment';


@Component({
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})


export class IncentivePoliciesCreatePageComponent implements OnInit {
  loading = false;
  steps: MenuItem[];
  activeIndex = 0;
  maxActivableIndex = 0;
  policyForm = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    rules: this.fb.group({
      weekday: [],
      time: [],
      range: [],
      rank: [],
    }),
    parameters: [[], Validators.required],
    formula: ['', Validators.required],
    unit: [{}, Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    private incentivePolicyService: IncentivePolicyService,
    private router: Router,
  ) {
    //
  }

  ngOnInit() {
    this.steps = [
      {
        label: 'Choix de l\'incitation',
        command: () => {
          this.setActiveIndex(0);
        },
      },
      {
        label: 'Formule d\'incitation',
        command: () => {
          this.setActiveIndex(1);
        },
      },
      {
        label: 'Conditions d\'attribution',
        command: () => {
          this.setActiveIndex(2);
        },
      },
      {
        label: 'Finalisation',
        command: () => {
          this.setActiveIndex(3);
        },
      },
    ];
    if (!environment.production) {
      this.maxActivableIndex = 5;
    }
  }

  setActiveIndex(stepIndex: number) {
    if (this.maxActivableIndex >= stepIndex && stepIndex !== 4 && stepIndex !== -1) this.activeIndex = stepIndex;
  }
  incentiveUnitPicked() {
    if (this.maxActivableIndex < 1) this.maxActivableIndex = 1;
  }

  incentiveParameterSet() {
    if (this.maxActivableIndex < 2) this.maxActivableIndex = 3;
  }

  incentiveFilterSet() {
    // if (this.maxActivableIndex < 3) this.maxActivableIndex = 3;
  }

  reset() {
    this.policyForm.reset();
    this.activeIndex = 0;
    this.maxActivableIndex = 0;
  }

  policySubmit(confirm) {
    if (confirm) {
      this.loading = true;
      this.incentivePolicyService.post(this.policyForm.value).subscribe(
          (response) => {
            this.loading = false;
            this.reset();
            this.router.navigate(['/dashboard/incentives/policies']);
          },
          () => {
            this.loading = false;
          },
      );
    }
  }
}
