import { Component, OnInit } from '@angular/core';
import {
  DynamicDialogRef,
  DynamicDialogConfig,
} from 'primeng/api';

import { TranslationService } from '~/services/translationService';
import { AuthenticationService } from '~/applicativeService/authentication/service';
import { OPERATOR_DATA } from '~/config/user/operatorData';
import { Operator } from '~/entities/database/operator';

import { OperatorService } from '../../../../../services/operatorService';


@Component({
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})

export class OperatorEditionDialogComponent implements OnInit {
  public operator: Operator;
  public headList = OPERATOR_DATA.data;
  public editableTypes: {} = OPERATOR_DATA.editInputType;
  public values = {};
  modified = false;
  loaded = false;

  constructor(
    private translationService: TranslationService,
    private authentificationService: AuthenticationService,
    private operatorService: OperatorService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
  ) {
  }

  public ngOnInit() {
    this.operator = new Operator();
    const { id } = this.config.data;
    this.operatorService.getOne(id).subscribe((operator: [Operator]) => {
      this.operator = operator[0];
      this.loaded = true;
    });
  }

  public update(patch) {
    this.modified = true;
    this.operatorService.patch(this.operator._id, patch).subscribe((operator:Operator) => {
      this.operator = operator;
      this.ref.close();
    });
  }

  public isEditable(head: string): boolean {
    return (OPERATOR_DATA.editable && OPERATOR_DATA.editable.includes(head));
  }


  public hasPermission(permission: string): boolean {
    return this.authentificationService.hasPermission(permission);
  }
}
