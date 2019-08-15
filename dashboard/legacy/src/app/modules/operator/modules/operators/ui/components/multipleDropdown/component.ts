import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { Operator } from '~/entities/database/operator';
import { ApiResponse } from '~/entities/responses/apiResponse';

import { OperatorService } from '../../../../../services/operatorService';
import { OPERATOR_MAIN } from '../../../../../config/main';

@Component({
  selector: 'app-operator-multiple-dropdown',
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})
export class OperatorMultipleDropdownComponent implements OnInit {
  constructor(private operatorService: OperatorService) {}

  operators = [];
  selectedOperators = [];
  filteredOperators = [];
  selectedOperatorIds: any[] = [];

  @Input()
  set operatorIds(operatorIds) {
    this.selectedOperatorIds = operatorIds;
    this.setSelectedOperators();
  }

  @Input() style = null;

  @Output() operatorIdsChange = new EventEmitter();

  public ngOnInit() {
    if (this.selectedOperatorIds.length > 0) {
      this.getSelectedOperators();
    }
    this.getOperators();
  }

  public getSelectedOperators() {
    const filters = [];
    this.selectedOperatorIds.forEach((operatorId) => filters.push(['_id', operatorId]));
    this.operatorService.get(filters).subscribe((operators: ApiResponse) => {
      operators.data.forEach((operator: Operator) => {
        this.operators.push({
          key: operator._id,
          value: operator.nom_commercial,
        });
      });
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
      this.filteredOperators = this.operators.filter((item) => regexp.test(item.value));
    } else {
      this.filteredOperators = this.operators.slice();
    }
  }

  public onSelect() {
    this.selectedOperatorIds = this.selectedOperators.map((operator) => operator.key);
    this.operatorIdsChange.emit(this.selectedOperatorIds);
  }

  public unSelect() {
    this.selectedOperatorIds = this.selectedOperators.map((operator) => operator.key);
    this.operatorIdsChange.emit(this.selectedOperatorIds);
  }

  private setSelectedOperators() {
    if (this.operators.length > 0) {
      this.selectedOperators = [];
      this.operators.forEach((operator) => {
        this.selectedOperatorIds.forEach((operatorId: string) => {
          if (operator.key === operatorId) {
            this.selectedOperators.push(operator);
          }
        });
      });
    }
  }
}
