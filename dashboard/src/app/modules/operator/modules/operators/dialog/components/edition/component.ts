import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/api';

import { TranslationService } from '~/shared/services/translationService';
import { AuthenticationService } from '~/applicativeService/authentication/service';
import { Operator } from '~/entities/database/operator';

import { OperatorService } from '../../../../../services/operatorService';

@Component({
  templateUrl: 'template.html',
})

export class OperatorEditionDialogComponent implements OnInit {
  public operator: Operator;
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
    this.operatorService.patch(this.operator._id, patch).subscribe((operator: Operator) => {
      this.operator = operator;
      this.ref.close();
    });
  }

  public hasPermission(permission: string): boolean {
    return this.authentificationService.hasPermission(permission);
  }
}
