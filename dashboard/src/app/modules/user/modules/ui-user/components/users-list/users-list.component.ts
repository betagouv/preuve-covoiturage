import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { User } from '~/core/entities/authentication/user';
import { UserService } from '~/core/services/authentication/user.service';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { USER_ROLES_FR, UserRoleEnum } from '~/core/enums/user/user-role.enum';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss'],
})
export class UsersListComponent implements OnInit {
  @Input() users: User[];
  // TODO: implement permission user.edit
  @Input() canEditUser = false;
  @Output() editUser = new EventEmitter<User>();

  constructor(
    public authService: AuthenticationService,
    public userService: UserService,
    private toastr: ToastrService,
  ) {}

  ngOnInit() {}

  onDelete(user: User) {
    /**
     this._dialog.confirm('Suppression',
     `Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.fullname} ?`,
     'Supprimer')
     .subscribre((result) => {
      if(!result) {
        return;
      }
      // DELETE
     });
     */
    this.userService.delete(user).subscribe(
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

  public onEdit(user: User) {
    this.editUser.emit(user);
  }
}
