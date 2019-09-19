import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { takeUntil, tap } from 'rxjs/operators';
import { FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import * as _ from 'lodash';

import { OperatorNameInterface } from '~/core/interfaces/operator/operatorInterface';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { Operator } from '~/core/entities/operator/operator';

import { OperatorService } from '../../../../services/operator.service';

@Component({
  selector: 'app-operators-autocomplete',
  templateUrl: './operators-autocomplete.component.html',
  styleUrls: ['./operators-autocomplete.component.scss'],
})
export class OperatorsAutocompleteComponent extends DestroyObservable implements OnInit {
  public operatorCtrl = new FormControl();

  public operators: OperatorNameInterface[] = [];

  public filteredOperators: OperatorNameInterface[] = [];

  // with operatorIds control
  @Input() parentForm: FormGroup;

  @ViewChild('operatorInput', { static: false }) operatorInput: ElementRef;

  constructor(public operatorService: OperatorService) {
    super();
  }

  ngOnInit() {
    this.loadOperators();
    this.operatorCtrl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .pipe(tap((literal) => this.filterOperators(literal)))
      .subscribe();
  }

  get operatorIdsControl(): FormControl {
    return <FormControl>this.parentForm.get('operator_ids');
  }

  /**
   * todo: refactor when search is made server side
   */
  getOperatorLabel(operatorId: string): string {
    return this.operators.find((operator) => operator._id === operatorId).nom_commercial;
  }

  public remove(operator: string): void {
    const index = this.operatorIdsControl.value.indexOf(operator);
    if (index >= 0) {
      const operators = [...this.operatorIdsControl.value];
      operators.splice(index, 1);
      this.operatorIdsControl.setValue(operators);
    }
  }

  public onOperatorSelect(event: MatAutocompleteSelectedEvent): void {
    const operatorIds: string[] = this.operatorIdsControl.value || [];
    operatorIds.push(event.option.value);
    this.operatorIdsControl.setValue(operatorIds);
    this.operatorInput.nativeElement.value = null;
    this.operatorCtrl.setValue(null);
  }

  private loadOperators() {
    if (!this.operatorService.operatorsLoaded) {
      this.operatorService
        .load()
        .pipe(takeUntil(this.destroy$))
        .subscribe();
    }
    this.operatorService._entities$.pipe(takeUntil(this.destroy$)).subscribe((operators) => {
      this.operators = operators.map((operator) => ({
        _id: operator._id,
        nom_commercial: operator.nom_commercial,
      }));
      this.filterOperators();
    });
  }

  private filterOperators(literal: string = ''): void {
    const selectedOperatorIds = this.operatorIdsControl.value || [];
    this.filteredOperators = this.operators.filter(
      (operator) =>
        selectedOperatorIds.indexOf(operator._id) === -1 && operator.nom_commercial.toLowerCase().includes(literal),
    );
  }
}
