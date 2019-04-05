import { Component, OnInit } from '@angular/core';
import {
  LazyLoadEvent,
  ConfirmationService,
  DialogService,
 } from 'primeng/api';

import { AuthenticationService } from '~/applicativeService/authentication/service';
import { TranslationService } from '~/services/translationService';
import { Aom } from '~/entities/database/aom';
import { TableService } from '~/services/tableService';
import { ApiResponse } from '~/entities/responses/apiResponse';
import { DIALOGSTYLE } from '~/config/dialog/dialogStyle';

import { AomService } from '../../services/aomService';
import { AomCreationDialogComponent } from '../../modules/dialog/components/creation/component';
import { AomEditionDialogComponent } from '../../modules/dialog/components/edition/component';
import { AOM_HEADERS } from '../../config/header';

@Component({
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})

export class AomListComponent implements OnInit {
  aoms;
  headList: string[] = AOM_HEADERS.main;
  selectedHeadList: string[] = AOM_HEADERS.selection;
  columns = [];
  selectedColumns = [];
  aom: Aom = new Aom();

  // list parameters
  total = 30;
  perPage = 10;
  loading = true;

  constructor(
      private aomService: AomService,
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
    this.aomService.get(filters).subscribe((response: ApiResponse) => {
      this.setTotal(response.meta);
      this.aoms = response.data;
      this.loading = false;
    });
  }

  create() {
    const config = {
      ...DIALOGSTYLE,
      header: 'Créer un AOM',
    };
    const ref = this.dialogService.open(AomCreationDialogComponent, config);

    ref.onClose.subscribe((aom: Aom) => {
      if (aom) {
        this.get();
      }
    });
  }

  delete(aom: Aom) {
    this.confirmationService.confirm({
      message: `Etes vous sûr de vouloir supprimer l'aom ${aom.name} ?`,
      accept: () => {
        this.aomService.delete(aom._id).subscribe(
          () => {
            this.get();
          },
        );
      },
    });
  }

  edit(aom) {
    const config = {
      ...DIALOGSTYLE,
      header: 'Éditer un AOM',
      data : {
        id: aom._id,
      },
    };
    const ref = this.dialogService.open(AomEditionDialogComponent, config);

    ref.onClose.subscribe(() => {
      this.get();
    });
  }

  hasPermission(permission: string): boolean {
    return this.authentificationService.hasPermission(permission);
  }

  getValue(aom: object, key: string): string {
    return this.translationService.getTableValue(aom, key);
  }

  getKey(key: string): string {
    return this.translationService.getTableKey(key);
  }

  loadLazy(event: LazyLoadEvent) {
    const filters = this.aomService.formatFiltersFromLazyEvent(event);
    this.get(filters);
  }

  private setTotal(meta) {
    if (meta.hasOwnProperty('pagination')) {
      this.total = meta['pagination']['total'];
      this.perPage = meta['pagination']['per_page'];
    }
  }
}
