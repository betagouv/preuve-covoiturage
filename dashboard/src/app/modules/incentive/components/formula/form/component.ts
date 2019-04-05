import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';

import { IncentiveParameter } from '~/entities/database/Incentive/incentiveParameter';

@Component({
  selector: 'app-incentive-formula-form',
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})

export class IncentiveFormulaFormComponent implements OnInit {
  loading = false;
  @Input() incentiveParametersList: [];
  @Input() incentiveFormulaForm: FormControl;
  @Input() incentiveParametersForm: FormControl;
  @Input()
  set addParameter(parameter: IncentiveParameter) {
    if (parameter && parameter.varname) {
      const previousValue = this.incentiveFormulaForm.value ? this.incentiveFormulaForm.value : '';
      this.incentiveFormulaForm.setValue(`${previousValue}${parameter.varname}`);
    }
  }

  @Output() save = new EventEmitter();

  constructor(
   ) {
     //
  }

  ngOnInit() {
    this.incentiveFormulaForm.valueChanges.subscribe((formula:string) => {
      const foundParameters = [];
      const distinct = (value, index, self) => {
        return self.indexOf(value) === index && value !== '';
      };
      const foundParametersVarnames = formula.split(/[^a-z_]+/).filter(distinct);
      this.incentiveParametersList.forEach((incentiveParameter: IncentiveParameter) => {
        if (foundParametersVarnames.indexOf(incentiveParameter.varname) !== -1) {
          foundParameters.push(incentiveParameter);
        }
      });
      this.incentiveParametersForm.patchValue(foundParameters);
    });
  }

  json() {
    return JSON.stringify(this.incentiveFormulaForm.errors);
  }

  saveFormula() {
    if (this.incentiveFormulaForm.valid && this.incentiveFormulaForm.value) {
      this.loading = true;
      setTimeout(() => this.loading = false, 1000); // tslint:disable-line:no-magic-numbers
      this.save.emit();
    }
  }
}
