import { Component, OnInit, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

import { Operator } from '~/entities/database/operator';

import { OperatorService } from '../../../../../services/operatorService';
import { OPERATOR_MAIN } from '../../../../../config/main';

@Component({
  selector: 'app-operator-form-dropdown',
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})
export class OperatorFormDropdownComponent implements OnInit {
  @Input() operatorId: FormControl;
  public operator;
  public operators = [];
  public filteredOperators = [];

  constructor(private operatorService: OperatorService) {}

  public ngOnInit() {
    if (this.operatorId) {
      this.getOperator();
    }
    this.getOperators();
  }

  public getOperator() {
    this.operatorService.getOne(this.operatorId.value).subscribe((response: Operator) => {
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
      const regexp = new RegExp(event.query);
      this.filteredOperators = this.operators.filter((item) => regexp.test(item.value));
    } else {
      this.filteredOperators = this.operators.slice();
    }
  }

  public onSelect(operator) {
    this.operator = operator;
    this.operatorId.setValue(operator.key);
    this.operatorId.markAsDirty();
  }
}
