import { Component, OnInit } from '@angular/core';

import { OperatorService } from '../../../../services/operator.service';

@Component({
  selector: 'app-operator-list-view',
  templateUrl: './operator-list-view.component.html',
  styleUrls: ['./operator-list-view.component.scss'],
})
export class OperatorListViewComponent implements OnInit {
  filterLiteral = '';
  showForm = false;
  isCreating = true;

  constructor(private _operatorService: OperatorService) {}

  ngOnInit() {}

  pipeFilter(literal: string) {
    this.filterLiteral = literal;
  }

  pipeEdit(operatorId: string) {
    this.isCreating = false;
    this._operatorService.operatorToEdit = operatorId;
    this.showForm = true;
  }

  close() {
    this.showForm = false;
  }

  showCreationForm(): void {
    // set new entity for form
    this._operatorService.setNewOperatorForCreation();
    this.isCreating = true;
    this.showForm = true;
    setTimeout(() => {
      document.getElementById('operatorForm-anchor').scrollIntoView({
        behavior: 'smooth',
      });
    }, 200);
  }
}
