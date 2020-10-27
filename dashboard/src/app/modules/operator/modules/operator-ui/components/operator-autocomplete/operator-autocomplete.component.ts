import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';

import { DestroyObservable } from '~/core/components/destroy-observable';
import { Operator } from '~/core/entities/operator/operator';
import { CommonDataService } from '~/core/services/common-data.service';

@Component({
  selector: 'app-operator-autocomplete',
  templateUrl: './operator-autocomplete.component.html',
  styleUrls: ['./operator-autocomplete.component.scss'],
})
export class OperatorAutocompleteComponent extends DestroyObservable implements OnInit {
  @Input() parentForm: FormGroup;
  @Input() cancellable = false;

  operatorCtrl = new FormControl();
  selectedOperator: Operator;
  selectedOperatorId: number;

  private focusDebounceTimer;

  public operators: Operator[] = [];

  public filteredOperators: Observable<Operator[]>;

  private _operatorForm: AbstractControl;

  constructor(private commonDataService: CommonDataService) {
    super();
  }

  private selectedOperatorUpdated(
    id = this._operatorForm && this._operatorForm.value ? this._operatorForm.value : null,
  ): void {
    this.selectedOperatorId = id;
    this.selectedOperator = this.operators
      ? this.operators.find((foperator) => this.selectedOperatorId === foperator._id)
      : null;

    this.operatorCtrl.setValue(this.selectedOperator ? this.selectedOperator.name : '');
    this.operatorCtrl.markAsUntouched();
    const val = this.parentForm.getRawValue();
    const newVal = this.selectedOperator ? this.selectedOperator._id : null;
    if (!val || val.operator_id !== newVal) {
      this.parentForm.patchValue({ operator_id: newVal });
    }
  }

  onOperatorSelect(operator: MatAutocompleteSelectedEvent): void {
    clearTimeout(this.focusDebounceTimer);
    this.selectedOperatorUpdated(operator.option.value);
  }

  onClearSelection(): void {
    this.selectedOperatorUpdated(null);
  }

  ngOnInit(): void {
    this.commonDataService.operators$.pipe(takeUntil(this.destroy$)).subscribe((operators) => {
      this.operators = operators;
      this.selectedOperatorUpdated();
    });

    this.filteredOperators = this.operatorCtrl.valueChanges.pipe(
      startWith(''),
      map((value) => this.filter(value)),
    );

    this._operatorForm = this.parentForm.get('operator_id');
    this._operatorForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => this.selectedOperatorUpdated());

    this.selectedOperatorUpdated();
  }

  private filter(value: string): Operator[] {
    if (!value || typeof value !== 'string') return this.operators;

    return this.operators
      ? this.operators.filter((operator) => operator.name.toLowerCase().includes(value.toLowerCase()))
      : null;
  }

  inputLostFocus(): void {
    clearTimeout(this.focusDebounceTimer);
    this.focusDebounceTimer = setTimeout(
      () => this.operatorCtrl.setValue(this.selectedOperator ? this.selectedOperator.name : ''),
      300,
    );
  }
}
