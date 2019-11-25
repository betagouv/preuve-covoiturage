import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { OperatorsPermissionsAdminType } from '~/core/types/permissionType';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { Operator } from '~/core/entities/operator/operator';
import { OperatorStoreService } from '~/modules/operator/services/operator-store.service';

@Component({
  selector: 'app-operator-list',
  templateUrl: './operator-list.component.html',
  styleUrls: ['./operator-list.component.scss'],
})
export class OperatorListComponent extends DestroyObservable implements OnInit {
  public editPermission: OperatorsPermissionsAdminType = 'operator.update';

  displayedColumns: string[] = ['name', 'actions'];

  @Output() edit = new EventEmitter();
  @Input() operators: Operator[];

  constructor(public operatorStoreService: OperatorStoreService, public authenticationService: AuthenticationService) {
    super();
  }

  ngOnInit() {}

  onEdit(operator) {
    this.edit.emit(operator);
  }
}
