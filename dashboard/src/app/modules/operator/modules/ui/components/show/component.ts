import { Component, OnInit, Input } from '@angular/core';

import { Operator } from '~/entities/database/operator';

import { OperatorService } from '../../../../services/operatorService';

@Component({
  selector: 'app-operator-show',
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})

export class OperatorShowComponent implements OnInit {
  @Input() operatorId: string;

  public operator = new Operator();

  constructor(
      private operatorService: OperatorService,
  ) {
  }

  ngOnInit() {
    this.operator.nom_commercial = 'Opérateur non trouvé dans la base';
    if (this.operatorId) {
      this.getOperator();
    }
  }

  public getOperator() {
    this.operatorService.getOne(this.operatorId).subscribe((response: Operator) => {
      if (response[0]) {
        this.operator = response[0];
      }
    });
  }
}
