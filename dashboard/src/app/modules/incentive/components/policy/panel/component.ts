import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, AbstractControl } from '@angular/forms';

import {
  DynamicDialogRef,
  DynamicDialogConfig,
} from 'primeng/api';

import { IncentivePolicy } from '~/entities/database/Incentive/incentivePolicy';
import { IncentiveParameter } from '~/entities/database/Incentive/incentiveParameter';

@Component({
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})

export class IncentivePolicyPanelComponent implements OnInit {
  public loading = false;
  public error = null;
  public incentivePolicy: IncentivePolicy;
  public incentivePolicyParametersForm = this.fb.array([]);

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    public fb: FormBuilder,
  ) {
  }

  ngOnInit(): void {
    const { policy, parameters, creation } = this.config.data;
    this.incentivePolicy = policy;
    this.incentivePolicyParametersForm.setValidators([
      this.coverAllParameters(this.incentivePolicy.parameters.map(param => param.varname)),
    ]);

    this.incentivePolicy.parameters.forEach((param, i) => {
      this.incentivePolicyParametersForm.push(
        this.getParameterForm(),
      );

      const { varname } = param;
      const value = parameters
        .filter(v => v.key === varname)
        .reduce((initial, paramValue) => paramValue.value ? paramValue.value : initial, undefined);

      this.incentivePolicyParametersForm.at(i).patchValue({
        value,
        key: varname,
      });
    });
  }

  coverAllParameters(parameters: string[]) {
    return (form: AbstractControl): { [key: string]: any } => {
      const { value } = form;
      const result = {};

      parameters.forEach((key) => {
        if (!value.find(v => v.key === key)) {
          result[key] = `Missing ${key} param`;
        }
      });

      return result;
    };
  }
  get labelSubmit() {
    return 'Enregistrer';
  }

  get valuesAreSet() {
    let set = true;
    this.incentivePolicyParametersForm.value.forEach((param) => {
      if (!param.value) {
        set = false;
      }
    });
    return set;
  }

  getParameterForm() {
    return this.fb.group({
      key: ['', Validators.required],
      value: ['', Validators.required],
    });
  }

  getParameterLabel(key) {
    const def = this.getParameterDefinition(key);
    return def ? def.label : '';
  }

  getParameterDefinition(key) {
    return this.incentivePolicy.parameters.find(param => param.varname === key);
  }

  getParameterHelper(key) {
    const def = this.getParameterDefinition(key);
    return def && def.helper ? def.helper : '';
  }

  onSubmit() {
    this.ref.close(this.incentivePolicyParametersForm.value);
  }

  onCancel() {
    this.ref.close();
  }
}
