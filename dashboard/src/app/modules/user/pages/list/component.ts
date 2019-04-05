import { Component, OnInit } from '@angular/core';
import {
  LazyLoadEvent,
  ConfirmationService,
  DialogService,
 } from 'primeng/api';

import { User } from '~/entities/database/user/user';
import { ROLES } from '~/config/roles';
import { GROUPS } from '~/config/groups';
import { AuthenticationService } from '~/applicativeService/authentication/service';
import { TranslationService } from '~/services/translationService';
import { TableService } from '~/services/tableService';
import { ApiResponse } from '~/entities/responses/apiResponse';
import { DIALOGSTYLE } from '~/config/dialog/dialogStyle';

import { UserService } from '../../services/userService';
import { UserCreationDialogComponent } from '../../modules/dialog/components/creation/component';
import { UserEditionDialogComponent } from '../../modules/dialog/components/edition/component';
import { USER_HEADERS } from '../../config/header';

@Component({
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})

export class UserListComponent implements OnInit {
  users;
  user: User = new User();
  headList: string[] = USER_HEADERS.main;
  selectedHeadList: string[] = USER_HEADERS.selection;
  rolesList: string[] = ROLES;
  groupsList: string[] = GROUPS;
  columns = [];
  selectedColumns = [];
  roles = [];
  groups = [];
  total = 30;
  loading = true;
  perPage = 10;

  constructor(
      private userService: UserService,
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
    for (const role of this.rolesList) {
      this.roles.push(this.ts.createLabel(role));
    }
    for (const group of this.groupsList) {
      this.groups.push(this.ts.createLabel(group));
    }
  }

  get(filters: any[any] = []) {
    this.loading = true;
    this.userService.get(filters).subscribe((response: ApiResponse) => {
      this.setTotal(response.meta);
      this.users = response.data;
      this.loading = false;
    });
  }

  create() {
    const config = {
      ...DIALOGSTYLE,
      header: 'Créer un utilisateur',
    };
    const ref = this.dialogService.open(UserCreationDialogComponent, config);

    ref.onClose.subscribe((user: User) => {
      if (user) {
        this.get();
      }
    });
  }

  edit(user) {
    const config = {
      ...DIALOGSTYLE,
      header: 'Éditer un utilisateur',
      data : {
        id: user._id,
      },
    };

    const ref = this.dialogService.open(UserEditionDialogComponent, config);

    ref.onClose.subscribe(() => {
      this.get();
    });
  }

  delete(user: User) {
    let username = user.email;
    if (user.firstname && user.lastname) {
      username = `${user.firstname} ${user.lastname}`;
    }

    this.confirmationService.confirm({
      message: `Etes vous sûr de vouloir supprimer l'utilisateur ${username} ?`,
      accept: () => {
        this.userService.delete(user._id).subscribe(
          () => {
            this.get();
          },
        );
      },
    });
  }


  hasPermission(permission: string): boolean {
    return this.authentificationService.hasPermission(permission);
  }

  getValue(token: object, key: string): string {
    return this.translationService.getTableValue(token, key);
  }

  getKey(key: string): string {
    return this.translationService.getTableKey(key);
  }

  loadLazy(event: LazyLoadEvent) {
    const filters = this.userService.formatFiltersFromLazyEvent(event);
    this.get(filters);
  }


  /* PRIVATES */

  private setTotal(meta) {
    if (meta.hasOwnProperty('pagination')) {
      this.total = meta['pagination']['total'];
      this.perPage = meta['pagination']['per_page'];
    }
  }
}
