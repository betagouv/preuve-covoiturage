import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';

import {
  DialogService,
} from 'primeng/api';

import { DIALOGSTYLE } from '~/config/dialog/dialogStyle';

import { IncentiveParameter } from '~/entities/database/Incentive/incentiveParameter';

import { IncentiveParameterCreationComponent } from '../creation/component';
import { IncentiveParameterService } from '../../../services/incentiveParameterService';

@Component({
  selector: 'app-incentive-parameter-form',
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})

export class IncentiveParameterFormComponent implements OnInit {
  public incentiveAvailableParameters: IncentiveParameter[] = [];
  public loading = true;
  parameterAddedToFormula: IncentiveParameter;
  incentiveAvailableInternalParameters: IncentiveParameter[] = [];
  incentiveAvailableExternalParameters: IncentiveParameter[] = [];

  @Input() incentiveParametersForm: FormControl;
  @Input() incentiveFormulaForm: FormControl;
  @Output() submit = new EventEmitter();

  constructor(
       private incentiveParameterService: IncentiveParameterService,
       private dialogService: DialogService,
   ) {
  }

  ngOnInit() {
    this.get();
  }

  get() {
    this.loading = true;
    this.incentiveParameterService.get().then((parameters: IncentiveParameter[]) => {
      this.incentiveAvailableParameters = parameters;
      this.incentiveAvailableInternalParameters = parameters.filter(value => value.internal);
      this.incentiveAvailableExternalParameters = parameters.filter(value => !value.internal);
      this.loading = false;
    });
  }

  addIncentiveParameter() {
    const config = {
      ...DIALOGSTYLE,
      header: 'Ajout d\'un paramètre',
    };

    const ref = this.dialogService.open(IncentiveParameterCreationComponent, config);

    ref.onClose.subscribe((parameter: IncentiveParameter) => {
      if (parameter) {
        this.incentiveParameterService.create(parameter);
        this.get();
      }
    });
  }

  addToFormula(value) {
    this.parameterAddedToFormula = value.value[0];
  }


  formulaSet() {
    this.submit.emit();
  }
}
