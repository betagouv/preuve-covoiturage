import { Component, OnInit } from '@angular/core';
import {
  ConfirmationService,
  DialogService,
  LazyLoadEvent,
 } from 'primeng/api';

import { AuthenticationService } from '~/applicativeService/authentication/service';
import { TranslationService } from '~/services/translationService';
import { TableService } from '~/services/tableService';
import { Operator } from '~/entities/database/operator';
import { HEADERS } from '~/config/headers';
import { ApiResponse } from '~/entities/responses/apiResponse';
import { DIALOGSTYLE } from '~/config/dialog/dialogStyle';

import { OperatorService } from '../../services/operatorService';
import { OperatorCreationDialogComponent } from '../../modules/dialog/components/creation/component';
import { OperatorEditionDialogComponent } from '../../modules/dialog/components/edition/component';

@Component({
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})

export class OperatorListComponent implements OnInit {
  operators;
  headList: string[] = HEADERS.operators.main;
  selectedHeadList: string[] = HEADERS.operators.selection;
  columns = [];
  selectedColumns = [];
  operator: Operator = new Operator();
  total = 30;
  perPage = 10;
  loading = true;

  constructor(
      private operatorService: OperatorService,
      private authentificationService: AuthenticationService,
      private translationService: TranslationService,
      private ts: TableService,
      private confirmationService: ConfirmationService,
      private dialogService: DialogService,
  ) {
    this.setColumns();
  }

  ngOnInit() {
    // FIX: do nothing ?
  }

  private setColumns() {
    for (const head of this.headList) {
      this.columns.push(this.ts.createColumn(head));
    }
    for (const head of this.selectedHeadList) {
      this.selectedColumns.push(this.ts.createColumn(head));
    }
  }

  get(filters: any[any] = []) {
    this.loading = true;
    this.operatorService.get(filters).subscribe((response: ApiResponse) => {
      this.setTotal(response.meta);
      this.operators = response.data;
      this.loading = false;
    });
  }

  public create() {
    const config = {
      ...DIALOGSTYLE,
      header: 'Créer un opérateur',
    };
    const ref = this.dialogService.open(OperatorCreationDialogComponent,
                                        config,
    );

    ref.onClose.subscribe((operator: Operator) => {
      if (operator) {
        this.get();
      }
    });
  }

  public edit(operator) {
    const config = {
      ...DIALOGSTYLE,
      header: 'Éditer un operator',
      data: {
        id: operator._id,
      },
    };
    const ref = this.dialogService.open(OperatorEditionDialogComponent, config);

    ref.onClose.subscribe(() => {
      this.get();
    });
  }

  public delete(operator: Operator) {
    this.confirmationService.confirm({
      message: `Etes vous sûr de vouloir supprimer l'operateur ${operator.nom_commercial} ?`,
      accept: () => {
        this.operatorService.delete(operator._id).subscribe(
          () => {
            this.get();
          },
        );
      },
    });
  }

  public hasPermission(permission: string): boolean {
    return this.authentificationService.hasPermission(permission);
  }

  public getValue(token: object, key: string): string {
    return this.translationService.getTableValue(token, key);
  }

  public getKey(key: string): string {
    return this.translationService.getTableKey(key);
  }

  loadLazy(event: LazyLoadEvent) {
    const filters = this.operatorService.formatFiltersFromLazyEvent(event);
    this.get(filters);
  }

  private setTotal(meta) {
    if (meta.hasOwnProperty('pagination')) {
      this.total = meta['pagination']['total'];
      this.perPage = meta['pagination']['per_page'];
    }
  }
}
