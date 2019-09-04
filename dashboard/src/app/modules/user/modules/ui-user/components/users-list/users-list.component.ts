import { Component, Input, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { takeUntil } from 'rxjs/operators';

import { User } from '~/core/entities/authentication/user';
import { UserService } from '~/core/services/authentication/user.service';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { USER_ROLES_FR, UserRoleEnum } from '~/core/enums/user/user-role.enum';
import { DestroyObservable } from '~/core/components/destroy-observable';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss'],
})
export class UsersListComponent extends DestroyObservable implements OnInit {
  @Input() users: User[];

  constructor(
    public authService: AuthenticationService,
    public userService: UserService,
    private toastr: ToastrService,
  ) {
    super();
  }

  ngOnInit() {}

  onDelete(user: User) {
    /**
     this._dialog.confirm('Suppression',
     `Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.fullname} ?`,
     'Supprimer')
     .pipe(takeUntil(this.destroy$))
     .subscribe((result) => {
      if(!result) {
        return;
      }
      // DELETE
     });
     */
    this.userService
      .delete(user)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        () => {
          this.toastr.success(`L'utilisateur ${user.firstname} ${user.lastname} a été supprimé`);
        },
        (err) => {
          this.toastr.error(err.message);
        },
      );
  }

  public getFrenchRole(role: UserRoleEnum): string {
    return USER_ROLES_FR[role];
  }

  public onSendInvitation(user: User) {
    console.log('SEND INVITATION');
  }
}
