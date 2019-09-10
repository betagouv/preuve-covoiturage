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
  public operatorForm;

  public operators: OperatorNameInterface[] = [];

  public filteredOperators: OperatorNameInterface[];

  @Input() parentForm: FormGroup;

  @ViewChild('operatorInput', { static: false }) operatorInput: ElementRef;

  constructor(private operatorService: OperatorService) {
    super();
  }

  ngOnInit() {
    this.loadOperators();
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
    this.operatorForm.setValue(operators.map((operatorNameObj) => operatorNameObj._id));
    this.operatorInput.nativeElement.value = null;
    this.operatorCtrl.setValue(null);
  }

  private loadOperators() {
    if (!this.operatorService.operatorsLoaded) {
      this.operatorService
        .load()
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          () => {},
          (err) => {
            // TODO TMP REMOVE WHEN FINISHED
            const mockOperators: Operator[] = [
              {
                _id: '5d763d57650de3750ee4eff4',
                nom_commercial: 'Operateur 1',
                raison_sociale: 'Opérateur 1 SAS',
                company: {
                  siren: '123456789',
                  naf_entreprise: '1234A',
                },
                address: {
                  street: '5 rue de brest',
                  postcode: '69002',
                  city: 'Lyon',
                  country: 'France',
                },
              },
              {
                _id: '5d763d5f5684e0b9bafaaeb0',
                nom_commercial: 'Operateur 2',
                raison_sociale: 'Opérateur 1 SAS',
                company: {
                  siren: '123456789',
                  naf_entreprise: '1234A',
                },
                address: {
                  street: '5 rue de brest',
                  postcode: '69002',
                  city: 'Lyon',
                  country: 'France',
                },
              },
            ];
            this.operatorService._entities$.next(mockOperators);
          },
        );
    }
    this.operatorService._entities$.pipe(takeUntil(this.destroy$)).subscribe((operators) => {
      this.operators = operators.map((operator) => ({
        _id: operator._id,
        nom_commercial: operator.nom_commercial,
      }));
    });
  }

  private filterOperators(operators: OperatorNameInterface[] = []): void {
    this.filteredOperators = _.differenceWith(
      this.operators,
      operators,
      (x: OperatorNameInterface, y: OperatorNameInterface) => x._id === y._id,
    );
  }
}
