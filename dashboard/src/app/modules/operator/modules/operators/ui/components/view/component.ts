import { Component, OnInit } from '@angular/core';
import { DialogService } from 'primeng/api';

import { Operator } from '~/entities/database/operator';
import { AuthenticationService } from '~/applicativeService/authentication/service';
import { DIALOGSTYLE } from '~/config/dialog/dialogStyle';

import { OperatorService } from '../../../../../services/operatorService';
import { OperatorEditionDialogComponent } from '../../../dialog/components/edition/component';

@Component({
  selector: 'app-operator-view',
  templateUrl: 'template.html',
})

export class OperatorViewComponent implements OnInit {
  operator: Operator = new Operator();

  constructor(
    private authentificationService: AuthenticationService,
    private dialogService: DialogService,
    private operatorService: OperatorService,
  ) {
  }

  ngOnInit() {
    const user = this.authentificationService.getUser();
    if (user.operator) {
      this.operator._id = user.operator;
      this.get();
    }
  }

  hasRole(role: string): boolean {
    return this.authentificationService.hasRole(role);
  }

  edit(aom) {
    const config = {
      ...DIALOGSTYLE,
      header: 'Éditer les données de l\'opérateur',
      data: {
        id: aom._id,
      },
    };

    const ref = this.dialogService.open(OperatorEditionDialogComponent, config);

    ref.onClose.subscribe(() => {
      this.get();
    });
  }

  private get() {
    this.operatorService.getOne(this.operator._id).subscribe((operator: Operator) => {
      this.set(operator[0]);
    });
  }

  private set(operator) {
    Object.assign(this.operator, operator);
  }
}
