import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import { Observable } from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';

import { OperatorService } from '~/modules/operator/services/operator.service';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { Operator } from '~/core/entities/operator/operator';

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

  constructor(private operatorService: OperatorService) {
    super();
  }

  updateOperator(operatorId: string) {}

  private selectedOperatorUpdated() {
    console.log('> selectedOperatorUpdated', this._operatorForm.value);
    this.selectedOperatorId = this._operatorForm.value ? this._operatorForm.value.toString() : null;
    this.selectedOperator = this.operators.find((foperator) => this.selectedOperatorId === foperator._id);
    this.operatorCtrl.setValue(this.selectedOperator ? this.selectedOperator.nom_commercial : '');
  }

  onOperatorSelect(operator: MatAutocompleteSelectedEvent) {
    console.log('operator : ', operator.option.value);
    // this.updateOperator(operator.option.value);
    this._operatorForm.setValue(operator.option.value);
    this._searchUpdate = false;
    // this.selectedOperatorId = operator.option.value;
    // this.selectedOperator = this.operators.find((foperator) => this.selectedOperatorId === foperator._id);
    // this.operatorCtrl.setValue(this.selectedOperator ? this.selectedOperator.nom_commercial : '');
    // this._operatorForm.setValue(this.selectedOperatorId);
  }

  ngOnInit() {
    this.filteredOperators = this.operatorCtrl.valueChanges.pipe(
      startWith(''),
      map((value) => this.filter(value)),
    );

    this._operatorForm = this.parentForm.get('operator');
    this._operatorForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => this.selectedOperatorUpdated());

    this.selectedOperatorUpdated();

    this.operatorService.operators$.pipe(takeUntil(this.destroy$)).subscribe((operators) => {
      this.operators = operators;
      console.log('this.operators : ', this.operators);
    });

    if (!this.operatorService.operators) this.operatorService.load();

    // this.selectedOperatorId = this._operatorForm.value;
    // this.selectedOperator = this.operators.find((operator) => this.selectedOperatorId === operator._id);
    // this.operatorCtrl.setValue(this.selectedOperator ? this.selectedOperator.nom_commercial : '');
    // this.filterOperators();
    // this._operatorForm = this.parentForm.get('operators');
    // this._operatorForm.valueChanges
    //   .pipe(tap((operators: OperatorNameInterface[]) => this.filterOperators(operators)))
    //   .subscribe();

    // setup service

    // this.operatorService.operators$
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe((operators) => this.filteredOperators = operators);
    //
    // this.operatorService.load();
  }

  // private filterOperators(operators: Opera[] = []) {
  //   return this.filteredOperators.filter((operator) => operator.)
  // }
  private filter(value: string): Operator[] {
    this._searchUpdate = true;
    console.log('value : ', value);
    return this.operators.filter((operator) => operator.nom_commercial.toLowerCase().includes(value.toLowerCase()));
  }

  inputLostFocus() {
    console.log('this._searchUpdate : ', this._searchUpdate);
    // if search field has been not been updated and input lost focus it restore original value.
    setTimeout(() => {
      if (this._searchUpdate) {
        this.operatorCtrl.setValue(this.selectedOperator ? this.selectedOperator.nom_commercial : '');
      }
    }, 100);
  }
}
