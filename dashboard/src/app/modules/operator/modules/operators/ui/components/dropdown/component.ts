import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { Operator } from '~/entities/database/operator';

import { OperatorService } from '../../../../../services/operatorService';
import { OPERATOR_MAIN } from '../../../../../config/main';

@Component({
  selector: 'app-operator-dropdown',
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})

export class OperatorDropdownComponent implements OnInit {
  public selectedOperatorId;

  @Input()
  set operatorId(operatorId) {
    this.selectedOperatorId = operatorId;
  }

  @Output() operatorIdChange = new EventEmitter();

  public operator;
  public operators = [];
  public filteredOperators = [];

  constructor(
      private operatorService: OperatorService,
  ) {
  }

  public ngOnInit() {
    if (this.selectedOperatorId) {
      this.getOperator();
    }
    this.getOperators();
  }

  public getOperator() {
    this.operatorService.getOne(this.selectedOperatorId.value).subscribe((response: Operator) => {
      if (response[0]) {
        this.operator = {
          key: response[0]._id,
          value: response[0].nom_commercial,
        };
      }
    });
  }

  public getOperators() {
    this.operatorService.get([['limit', OPERATOR_MAIN.operator_query_limit]]).subscribe((response) => {
      this.operators = response.data.map((item) => {
        const normalizedItem = {
          key: item._id,
          value: item.nom_commercial,
        };
        return normalizedItem;
      });
    });
  }

  public filter(event) {
    if (event && event.query) {
      const regexp = new RegExp(event.query, 'i');
      this.filteredOperators = this.operators.filter(item => regexp.test(item.value));
    } else {
      this.filteredOperators = this.operators.slice();
    }
  }

  public onSelect(operator) {
    this.operator = operator;
    this.selectedOperatorId = operator.key;
    this.operatorIdChange.emit(operator.key);
  }
}
