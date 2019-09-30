import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { takeUntil } from 'rxjs/operators';

import { User } from '~/core/entities/authentication/user';
import { UserService } from '~/modules/user/services/user.service';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { USER_ROLES_FR, UserRoleEnum } from '~/core/enums/user/user-role.enum';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { DialogService } from '~/core/services/dialog.service';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss'],
})
export class UsersListComponent extends DestroyObservable implements OnInit {
  @Input() users: User[];
  // TODO: implement permission user.edit
  @Input() canEditUser = false;
  @Output() editUser = new EventEmitter<User>();

  constructor(
    public authService: AuthenticationService,
    public userService: UserService,
    private toastr: ToastrService,
    private dialogService: DialogService,
  ) {
    super();
  }

  ngOnInit() {}

  onDelete(user: User) {
    this.dialogService
      .confirm('Utilisateurs', 'Voulez-vous supprimer cet utilisateur ?')
      .pipe(takeUntil(this.destroy$))
      .subscribe((hasConfirmed) => {
        if (hasConfirmed) {
          this.userService
            .deleteList(user._id)
            .pipe(takeUntil(this.destroy$))
            .subscribe(
              (data) => {
                const deletedUser = data[0];
                this.toastr.success(`L'utilisateur ${deletedUser.firstname} ${deletedUser.lastname} a été supprimé`);
              },
              (err) => {
                this.toastr.error(err.message);
              },
            );
        }
      });
  }

  public getFrenchRole(role: UserRoleEnum): string {
    return USER_ROLES_FR[role];
  }

  public onSendInvitation(user: User) {
    this.authService
      .sendInviteEmail(user)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.toastr.success(`L'utilisateur ${user.firstname} ${user.lastname} va recevoir une nouvelle invitation`);
      });
  }

  public onEdit(user: User) {
    this.editUser.emit(user);
  }
}
