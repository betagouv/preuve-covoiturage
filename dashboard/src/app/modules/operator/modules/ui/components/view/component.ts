import { Component, OnInit } from '@angular/core';
import { DialogService } from 'primeng/api';


import { Operator } from '~/entities/database/operator';
import { AuthenticationService } from '~/applicativeService/authentication/service';
import { DIALOGSTYLE } from '~/config/dialog/dialogStyle';
import { OperatorService } from '~/modules/operator/services/operatorService';
import { OperatorEditionDialogComponent } from '~/modules/operator/modules/dialog/components/edition/component';


@Component({
  selector: 'app-operator-view',
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
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

  /**
   * get operator from database
   */
  private get() {
    this.operatorService.getOne(this.operator._id).subscribe((operator: Operator) => {
      this.set(operator[0]);
    });
  }

  /**
   * update display
   */
  private set(operator) {
    Object.assign(this.operator, operator);
  }

  hasRole(role: string): boolean {
    return this.authentificationService.hasRole(role);
  }

  edit(aom) {
    const config = {
      ...DIALOGSTYLE,
      header: 'Éditer les données de l\'AOM',
      data : {
        id: aom._id,
      },
    };

    const ref = this.dialogService.open(OperatorEditionDialogComponent, config);

    ref.onClose.subscribe(() => {
      this.get();
    });
  }
}
