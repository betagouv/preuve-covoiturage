import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import { Observable } from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';

import { OperatorService } from '~/modules/operator/services/operator.service';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { Operator } from '~/core/entities/operator/operator';
import { CommonDataService } from '~/core/services/common-data.service';

@Component({
  selector: 'app-operator-autocomplete',
  templateUrl: './operator-autocomplete.component.html',
  styleUrls: ['./operator-autocomplete.component.scss'],
})
export class OperatorAutocompleteComponent extends DestroyObservable implements OnInit {
  private _searchUpdate: boolean;

  @Input() parentForm: FormGroup;

  operatorCtrl = new FormControl();
  selectedOperator: Operator;
  selectedOperatorId: string;

  public operators: Operator[] = [];

  public filteredOperators: Observable<Operator[]>;

  private _operatorForm: AbstractControl;

  constructor(private operatorService: OperatorService, private commonDataService: CommonDataService) {
    super();
  }

  updateOperator(operatorId: string) {}

  private selectedOperatorUpdated() {
    this.selectedOperatorId = this._operatorForm.value ? this._operatorForm.value.toString() : null;
    this.selectedOperator = this.operators.find((foperator) => this.selectedOperatorId === foperator._id);
    this.operatorCtrl.setValue(this.selectedOperator ? this.selectedOperator.nom_commercial : '');
  }

  onOperatorSelect(operator: MatAutocompleteSelectedEvent) {
    // this.updateOperator(operator.option.value);
    this._operatorForm.setValue(operator.option.value);
    this._searchUpdate = false;
    // this.selectedOperatorId = operator.option.value;
    // this.selectedOperator = this.operators.find((foperator) => this.selectedOperatorId === foperator._id);
    // this.operatorCtrl.setValue(this.selectedOperator ? this.selectedOperator.nom_commercial : '');
    // this._operatorForm.setValue(this.selectedOperatorId);
  }

  ngOnInit() {
    // this.operatorService.operators$.pipe(takeUntil(this.destroy$)).subscribe((operators) => {
    //   this.operators = operators;
    // });

    // this.operatorService
    //   .load()
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe((operators) => {
    //     this.operators = operators;
    //   });

    this.commonDataService.operators$.pipe(takeUntil(this.destroy$)).subscribe((operators) => {
      this.operators = operators;
    });

    this.filteredOperators = this.operatorCtrl.valueChanges.pipe(
      startWith(''),
      map((value) => this.filter(value)),
    );

    this._operatorForm = this.parentForm.get('operator');
    this._operatorForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => this.selectedOperatorUpdated());

    this.selectedOperatorUpdated();
  }

  // private filterOperators(operators: Opera[] = []) {
  //   return this.filteredOperators.filter((operator) => operator.)
  // }
  private filter(value: string): Operator[] {
    this._searchUpdate = true;
    return this.operators.filter((operator) => operator.nom_commercial.toLowerCase().includes(value.toLowerCase()));
  }

  inputLostFocus() {
    // if search field has been not been updated and input lost focus it restore original value.
    setTimeout(() => {
      if (this._searchUpdate) {
        this.operatorCtrl.setValue(this.selectedOperator ? this.selectedOperator.nom_commercial : '');
      }
    }, 100);
  }
}
