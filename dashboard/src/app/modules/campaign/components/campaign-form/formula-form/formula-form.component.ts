import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { IncentiveFormulaParameterInterface } from '~/core/interfaces/campaign/campaignInterface';
import { CampaignService } from '~/modules/campaign/services/campaign.service';
import { formulaValidator } from '~/modules/campaign/validators/formula.validator';

@Component({
  selector: 'app-formula-form',
  templateUrl: './formula-form.component.html',
  styleUrls: ['./formula-form.component.scss'],
})
export class FormulaFormComponent implements OnInit {
  @Input() isFirst: boolean;
  @Input() index: number;
  @Input() formulaFormGroup: FormGroup;

  public parameterCtrl = new FormControl();
  public filteredParameters: Observable<IncentiveFormulaParameterInterface[]>;

  constructor(public campaignService: CampaignService) {}

  ngOnInit() {
    this.initParameters();
    this.initFormValidator();

    this.filteredParameters = this.parameterCtrl.valueChanges.pipe(
      map((input: string) => this.filterParameters(input)),
    );
  }

  get controls() {
    return this.formulaFormGroup.controls;
  }

  get formula() {
    return this.controls.formula.value;
  }

  get parameters(): IncentiveFormulaParameterInterface[] {
    return this.campaignService._parameters$.value;
  }

  public initParameters() {
    if (!this.campaignService._parametersLoaded$.value) {
      this.campaignService.loadFormulaParameters().subscribe(
        () => {
          //
        },
        () => {
          // todo: remove
          this.campaignService._parameters$.next([
            {
              _id: null,
              varname: 'pour_conducteur',
              internal: true,
              helper: 'Incitation pour le conducteur',
            },
            {
              _id: null,
              varname: 'distance',
              internal: true,
              helper: 'Distance en mètre',
            },
            {
              _id: null,
              varname: 'nombre_passager',
              internal: false,
              helper: 'Le nombre de passagers présents dans le véhicule',
            },
            {
              _id: null,
              varname: 'somme_incitations_passager',
              internal: false,
              helper: 'Sommes des incitations de tous les passagers',
            },
            {
              _id: null,
              varname: 'incitation',
              internal: true,
              helper: 'Incitation calculé précédemment de la personne',
            },
          ]);
          this.campaignService._parametersLoaded$.next(true);
        },
      );
    }
  }

  public initFormValidator() {
    // this.controls.formula.setValidators([Validators.required, formulaValidator(this.campaignService, this.index)]);
  }

  public onParameterSelect(event) {
    const parameter = event.option.viewValue;
    this.addToFormula(parameter);
  }

  private addToFormula(varname: string) {
    const formula = `${this.formula}${varname}`;
    this.controls.formula.setValue(formula);
  }

  private filterParameters(value: string = ''): IncentiveFormulaParameterInterface[] {
    const filterValue = value.toLowerCase();
    return this.parameters.filter(
      (parameter) =>
        // filter out varname that depend on previously calculated incentive
        (this.index === 0 ? parameter.varname.toLowerCase().indexOf('incitation') === -1 : true) &&
        parameter.varname.toLowerCase().indexOf(filterValue) !== -1,
    );
  }
}
