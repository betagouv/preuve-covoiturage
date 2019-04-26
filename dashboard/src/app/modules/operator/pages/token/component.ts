import { Component, OnInit } from '@angular/core';
import { ConfirmationService, DialogService } from 'primeng/api';

import { TranslationService } from '~/shared/services/translationService';
import { AuthenticationService } from '~/applicativeService/authentication/service';
import { Token } from '~/entities/database/token';
import { ApiResponse } from '~/entities/responses/apiResponse';
import { DIALOGSTYLE } from '~/config/dialog/dialogStyle';
import { TableService } from '~/shared/services/tableService';
import { Meta } from '~/entities/responses/meta';

import { OperatorTokenService } from '../../services/operatorTokenService';
import { OPERATOR_HEADERS } from '../../config/header';
import { OperatorNewTokenDialogComponent } from '../../modules/token/components/token/component';
import { OperatorTokenCreationDialogComponent } from '../../modules/token/components/creation/component';

@Component({
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})

export class OperatorTokenPageComponent implements OnInit {
  public tokens: any = [];
  public headList: string[] = OPERATOR_HEADERS.tokens.main;
  public name = 'Serveur';
  public loading = true;
  total = 30;
  perPage = 10;
  columns = [];


  constructor(private operatorTokenService: OperatorTokenService,
              private translationService: TranslationService,
              private authentificationService: AuthenticationService,
              private confirmationService: ConfirmationService,
              private ts: TableService,
              private dialogService: DialogService,

  ) {
    this.setColumns();
  }

  ngOnInit() {
    this.get();
  }

  private setColumns() {
    for (const head of this.headList) {
      this.columns.push(this.ts.createColumn(head));
    }
  }


  public get(filters: any[any] = []) {
    this.operatorTokenService.get().subscribe((response: ApiResponse) => {
      this.setTotal(response.meta ? response.meta : null);
      this.tokens = response.data;
      this.loading = false;
    });
  }


  create(): void {
    this.openTokenFormDialog();
  }


  openTokenFormDialog() {
    const config = {
      ...DIALOGSTYLE,
      header: 'Créer un TOKEN',
    };
    const ref = this.dialogService.open(OperatorTokenCreationDialogComponent, config);

    ref.onClose.subscribe((token:string) => {
      if (token) {
        this.openNewTokenDialog(token);
      }
    });
  }

  openNewTokenDialog(token: string) {
    const config = {
      ...DIALOGSTYLE,
      header: 'Nouveau Token',
      data: {
        token,
      },
    };
    const ref = this.dialogService.open(OperatorNewTokenDialogComponent, config);

    ref.onClose.subscribe(() => {
      this.get();
    });
  }


  public delete(token: Token) {
    const id = token._id;
    const name = token.name;
    this.confirmationService.confirm({
      message: `Etes vous sûr de vouloir supprimer le token du serveur ${name} ?`,
      accept: () => {
        this.operatorTokenService.delete(id).subscribe(
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


  private setTotal(meta: Meta) {
    if (meta && meta.hasOwnProperty('pagination')) {
      this.total = meta['pagination']['total'];
      this.perPage = meta['pagination']['per_page'];
    }
  }
}
