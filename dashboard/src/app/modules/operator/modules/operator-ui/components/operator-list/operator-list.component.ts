import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { RegistryPermissionsAdminType } from '~/core/types/permissionType';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { Operator } from '~/core/entities/operator/operator';
import { OperatorStoreService } from '~/modules/operator/services/operator-store.service';
import { DialogService } from '~/core/services/dialog.service';

@Component({
  selector: 'app-operator-list',
  templateUrl: './operator-list.component.html',
  styleUrls: ['./operator-list.component.scss'],
})
export class OperatorListComponent extends DestroyObservable implements OnInit {
  public editPermission: RegistryPermissionsAdminType = 'operator.update';
  public deletePermission: RegistryPermissionsAdminType = 'operator.delete';

  displayedColumns: string[] = ['name', 'actions'];

  @Output() edit = new EventEmitter();
  @Input() operators: Operator[];

  constructor(
    public operatorStoreService: OperatorStoreService,
    public authenticationService: AuthenticationService,
    private _dialogService: DialogService,
    private _toastr: ToastrService,
  ) {
    super();
  }

  ngOnInit() {}

  onEdit(operator) {
    this.edit.emit(operator);
  }

  onDelete(operator) {
    this._dialogService
      .confirm('Voulez-vous supprimer cet opérateur ?', '')
      .pipe(takeUntil(this.destroy$))
      .subscribe((hasConfirmed) => {
        if (hasConfirmed) {
          this.operatorStoreService.delete(operator).subscribe(
            () => {
              this._toastr.success(`L'opérateur ${operator.name} a été supprimé`);
            },
            (err) => {
              this._toastr.error(err.message);
            },
          );
        }
      });
  }
}
