import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { OperatorsPermissionsAdminType } from '~/core/types/permissionType';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { OperatorService } from '~/modules/operator/services/operator.service';
import { Operator } from '~/core/entities/operator/operator';

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

  constructor(private _operatorService: OperatorService, public authenticationService: AuthenticationService) {
    super();
  }

  ngOnInit() {}

  get operatorsloading(): boolean {
    return this._operatorService.loading;
  }

  get operatorsloaded(): boolean {
    return this._operatorService.operatorsLoaded;
  }

  onEdit(operator) {
    this.edit.emit(operator);
  }
}
