import { Component, OnInit } from '@angular/core';

import { OperatorService } from '../../../../services/operator.service';
import { Operator } from '~/core/entities/operator/operator';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-operator-list-view',
  templateUrl: './operator-list-view.component.html',
  styleUrls: ['./operator-list-view.component.scss'],
})
export class OperatorListViewComponent implements OnInit {
  filterLiteral = '';
  showForm = false;
  isCreating = true;

  operator$: BehaviorSubject<Operator> = new BehaviorSubject<Operator>(null);

  constructor(private _operatorService: OperatorService) {}

  ngOnInit() {
    this.showForm = false;
  }

  pipeFilter(literal: any) {
    this.filterLiteral = literal;
  }

  pipeEdit(operator: any) {
    console.log('operator : ', operator);
    this.isCreating = false;
    this.operator$.next(operator);
    this.showForm = true;
  }

  close() {
    console.log('> close');
    this.showForm = false;
  }

  showCreationForm(): void {
    // set new entity for form
    this._operatorService.setNewOperatorForCreation();
    // this.isCreating = true;
    this.showForm = true;

    this.operator$.next(null);

    setTimeout(() => {
      document.getElementById('operatorForm-anchor').scrollIntoView({
        behavior: 'smooth',
      });
    }, 200);
  }
}
