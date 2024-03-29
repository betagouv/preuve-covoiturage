import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { filter, takeUntil, tap } from 'rxjs/operators';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { OperatorNameInterface } from '~/core/interfaces/operator/operatorInterface';
import { CommonDataService } from '~/core/services/common-data.service';

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

  // if different from default
  @Input() fieldName = 'operatorIds';

  @ViewChild('operatorInput') operatorInput: ElementRef;

  constructor(private commonDataService: CommonDataService) {
    super();
  }

  ngOnInit(): void {
    this.loadOperators();
    this.operatorCtrl.valueChanges
      .pipe(
        filter((literal) => literal !== null && literal !== undefined && typeof literal === 'string'),
        tap((literal: string) => this.filterOperators(literal)),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  get operatorIdsControl(): FormControl {
    return this.parentForm.get(this.fieldName) as FormControl;
  }

  getOperatorLabel(operatorId: number): string {
    return this.operators.find((operator) => operator._id === operatorId).name;
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
    this.operatorCtrl.setValue('');
  }

  private loadOperators(): void {
    this.commonDataService.operators$.pipe(takeUntil(this.destroy$)).subscribe((operators) => {
      this.operators = operators
        ? operators.map((operator) => ({
            _id: operator._id,
            name: operator.name,
          }))
        : [];
      this.filterOperators();
    });
  }

  private filterOperators(literal = ''): void {
    const selectedOperatorIds = this.operatorIdsControl.value || [];
    this.filteredOperators = this.operators.filter(
      (operator) =>
        selectedOperatorIds.indexOf(operator._id) === -1 && operator.name.toLowerCase().includes(literal.toLowerCase()),
    );
  }
}
