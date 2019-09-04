import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { takeUntil, tap } from 'rxjs/operators';
import { FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import * as _ from 'lodash';

import { OperatorNameInterface } from '~/core/interfaces/operator/operatorInterface';
import { DestroyObservable } from '~/core/components/destroy-observable';

@Component({
  selector: 'app-operators-autocomplete',
  templateUrl: './operators-autocomplete.component.html',
  styleUrls: ['./operators-autocomplete.component.scss'],
})
export class OperatorsAutocompleteComponent extends DestroyObservable implements OnInit {
  public operatorCtrl = new FormControl();
  public operatorForm;

  public filteredOperators: OperatorNameInterface[];

  @Input() parentForm: FormGroup;

  @ViewChild('operatorInput', { static: false }) operatorInput: ElementRef;

  // TODO TMP REMOVE WHEN FINISHED
  public mockOperators: OperatorNameInterface[] = [
    {
      _id: 'eZEFZEF45455',
      nom_commercial: 'Operateur 1',
    },
    {
      _id: 'eZEFZEEEF45455',
      nom_commercial: 'Operateur 2',
    },
  ];

  constructor() {
    super();
  }

  ngOnInit() {
    this.filterOperators();
    this.operatorForm = this.parentForm.get('operators');
    this.operatorForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .pipe(tap((operators: OperatorNameInterface[]) => this.filterOperators(operators)))
      .subscribe();
  }

  public remove(operator: OperatorNameInterface): void {
    const index = this.operatorForm.value.indexOf(operator);
    if (index >= 0) {
      const operators = [...this.operatorForm.value];
      operators.splice(index, 1);
      this.operatorForm.setValue(operators);
    }
  }

  public onOperatorSelect(event: MatAutocompleteSelectedEvent): void {
    const operators: OperatorNameInterface[] = this.operatorForm.value || [];
    operators.push({ _id: event.option.value, nom_commercial: event.option.viewValue });
    this.operatorForm.setValue(operators);
    this.operatorInput.nativeElement.value = null;
    this.operatorCtrl.setValue(null);
  }

  private filterOperators(operators: OperatorNameInterface[] = []): void {
    this.filteredOperators = _.differenceWith(
      this.mockOperators,
      operators,
      (x: OperatorNameInterface, y: OperatorNameInterface) => x._id === y._id,
    );
  }
}
