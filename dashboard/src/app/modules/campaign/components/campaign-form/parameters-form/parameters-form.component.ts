import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { takeUntil } from 'rxjs/operators';

import { IncentiveUnitEnum, INCENTIVE_UNITS_FR } from '~/core/enums/campaign/incentive-unit.enum';
import { Campaign } from '~/core/entities/campaign/campaign';
import { DialogService } from '~/core/services/dialog.service';
import { CampaignService } from '~/modules/campaign/services/campaign.service';
import { IncentiveFormula } from '~/core/entities/campaign/incentive-formula';
import { DestroyObservable } from '~/core/components/destroy-observable';

@Component({
  selector: 'app-parameters-form',
  templateUrl: './parameters-form.component.html',
  styleUrls: ['./parameters-form.component.scss', '../campaign-sub-form.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
  ],
})
export class ParametersFormComponent extends DestroyObservable implements OnInit {
  @Input() campaignForm: FormGroup;

  retributionsFormArray: FormArray = new FormArray([]);
  minDate = moment().add(1, 'days');
  incentiveUnitKeys = Object.values(IncentiveUnitEnum);
  incentiveUnitFr = INCENTIVE_UNITS_FR;

  constructor(
    private currencyPipe: CurrencyPipe,
    private numberPipe: DecimalPipe,
    private _formBuilder: FormBuilder,
    private dialog: DialogService,
    private campaignService: CampaignService,
  ) {
    super();
  }

  ngOnInit() {
    this.initRetributionFormArray();
    this.initFormArrayChangeDetection();
    this.initRestrictionFormArray();
    this.initFormulasFormArray();
  }

  get controls() {
    return this.campaignForm.controls;
  }

  get restrictionFormArray(): FormArray {
    return <FormArray>this.campaignForm.get('restrictions');
  }

  get retributionParametersForm(): FormGroup {
    return <FormGroup>this.campaignForm.get('retributionParameters');
  }

  get rulesForm(): FormGroup {
    return <FormGroup>this.campaignForm.get('rules');
  }

  get formulasFormArray(): FormArray {
    return <FormArray>this.campaignForm.get('formulas');
  }

  get exportModeControl() {
    return this.controls.expertMode;
  }

  showDateLabel(): string {
    const dateBegin = this.controls.start.value;
    const dateEnd = this.controls.end.value;

    if (dateBegin && dateEnd) {
      return `Du ${moment(dateBegin).format('dddd DD MMMM YYYY')} au ${moment(dateEnd).format('dddd DD MMMM YYYY')}`;
    }
    return '';
  }

  showAmountLabel(): string {
    const amount = this.controls.max_amount.value;
    const unit = this.controls.amount_unit.value;
    if (amount && unit) {
      if (unit === IncentiveUnitEnum.EUR) {
        return this.currencyPipe.transform(amount, 'EUR', 'symbol', '1.0-0');
      }
      return `${this.numberPipe.transform(amount, '1.0-0', 'FR')} points`;
    }
  }

  showRestrictionLabel(): string {
    if (this.restrictionFormArray && this.restrictionFormArray.length > 0) {
      const multipleRestrictions = this.restrictionFormArray.length > 1;
      return `${this.restrictionFormArray.length} restriction${multipleRestrictions ? 's' : ''}`;
    }
    return 'Pas de restrictions';
  }

  addRestriction() {
    this.restrictionFormArray.push(this.generateRestrictionFormGroup());
  }

  removeRestriction(idx) {
    this.restrictionFormArray.removeAt(idx);
  }

  isRestrictionFormArrayTouched() {
    for (const control of this.restrictionFormArray.controls) {
      if (!control.valid && control.touched) {
        return true;
      }
    }
    return false;
  }

  onStaggeredChange($event) {
    this.retributionsFormArray.clear();
    this.retributionsFormArray.push(this.generateStaggeredFormGroup());
    if ($event.source._selected) {
      this.retributionsFormArray.push(this.generateStaggeredFormGroup());
    }
  }

  onConductorProportionalPassengers($event) {
    this.retributionParametersForm.controls.conductorProportionalPassengers.setValue($event.source._selected);
  }

  addStaggered() {
    this.retributionsFormArray.push(this.generateStaggeredFormGroup());
  }

  removeStaggered(idx) {
    this.retributionsFormArray.removeAt(idx);
  }

  generateStaggeredFormGroup(): FormGroup {
    return this._formBuilder.group({
      valueForDriver: [null, [Validators.required, Validators.min(0)]],
      valueForPassenger: [null, [Validators.required, Validators.min(0)]],
      perPassenger: [false],
      free: [false],
      perKmForDriver: [false],
      perKmForPassenger: [false],
      min: [null],
      max: [null],
    });
  }

  setExpertMode($event) {
    if (this.exportModeControl.value) {
      $event.source.checked = true;
      this.dialog
        .confirm(
          'Quitter le mode expert',
          `Attention, vous risquez de perdre les données non enregistrées !`,
          'Confirmer',
        )
        .pipe(takeUntil(this.destroy$))
        .subscribe((result) => {
          if (result) {
            this.exportModeControl.setValue(false);
            this.formulasFormArray.clear();
            this.retributionsFormArray.clear();
            this.initRetributionFormArray();
            this.controls.formula_expression.setValue(null);
          }
        });
    } else {
      this.exportModeControl.setValue(true);
    }
  }

  addFormula(): void {
    this.formulasFormArray.push(this.generateFormulaFormGroup());
  }

  removeFormula(idx): void {
    this.dialog
      .confirm('Suppression', `Êtes-vous sûr de vouloir supprimer cette formule ?`, 'Supprimer')
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          this.formulasFormArray.removeAt(idx);
        }
      });
  }

  generateFormulaFormGroup(incentiveFormula: IncentiveFormula = { formula: '' }): FormGroup {
    return this._formBuilder.group({
      formula: [incentiveFormula.formula],
    });
  }

  generateRestrictionFormGroup(): FormGroup {
    return this._formBuilder.group({
      quantity: [null],
      is_driver: [null],
      period: [null],
    });
  }

  private initRetributionFormArray() {
    this.retributionsFormArray.push(this.generateStaggeredFormGroup());
  }

  private initRestrictionFormArray() {
    if (this.restrictionFormArray.controls.length === 0) {
      this.restrictionFormArray.push(this.generateRestrictionFormGroup());
    }
  }

  private initFormulasFormArray() {
    if (this.campaignForm.controls.expertMode.value && this.formulasFormArray.controls.length === 0) {
      this.formulasFormArray.push(this.generateFormulaFormGroup());
    }
  }

  private initFormArrayChangeDetection() {
    this.retributionsFormArray.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((retribution) => {
      const formula = this.campaignService.tranformIntoFormula(retribution);
      // tslint:disable-next-line:max-line-length
      const explanation = this.campaignService.getExplanationFromRetributions(
        retribution,
        this.campaignForm.controls.amount_unit.value,
        this.campaignForm.controls.amount_unit.value,
      );
      const incentiveFormula = new IncentiveFormula({
        formula,
      });
      this.formulasFormArray.clear();
      this.campaignForm.controls.formula_expression.setValue(explanation);
      this.formulasFormArray.push(this.generateFormulaFormGroup(incentiveFormula));
    });
  }
}
