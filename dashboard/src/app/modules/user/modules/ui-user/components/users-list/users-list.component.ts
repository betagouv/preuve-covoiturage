import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { takeUntil } from 'rxjs/operators';
import { MatPaginator } from '@angular/material';

import { User } from '~/core/entities/authentication/user';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { USER_ROLES_FR, UserRoleEnum } from '~/core/enums/user/user-role.enum';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { DialogService } from '~/core/services/dialog.service';
import { UserApiService } from '~/modules/user/services/user-api.service';
import { UserStoreService } from '~/modules/user/services/user-store.service';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss'],
})
export class UsersListComponent extends DestroyObservable implements OnInit, AfterViewInit {
  @Input() users: User[] = [];
  @Input() canEditUser = false;
  @Output() editUser = new EventEmitter<User>();

  displayedColumns: string[] = ['name', 'email', 'role', 'actions'];

  constructor(
    public userStoreService: UserStoreService,
    public authService: AuthenticationService,
    private toastr: ToastrService,
    private dialogService: DialogService,
  ) {
    super();
  }

  ngOnInit() {}

  ngAfterViewInit() {}

  onDelete(user: User) {
    this.dialogService
      .confirm('Utilisateurs', 'Voulez-vous supprimer cet utilisateur ?')
      .pipe(takeUntil(this.destroy$))
      .subscribe((hasConfirmed) => {
        if (hasConfirmed) {
          this.userStoreService
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
      });
  }

  public canReInvite(user: User): boolean {
    return (
      (user.status === 'invited' || user.status === 'pending') &&
      this.authService.hasAnyPermission(['user.invite']) &&
      !this.isCurrentUser(user._id)
    );
  }

  public isCurrentUser(id: number): boolean {
    return this.authService.user._id === id;
  }

  public getFrenchRole(role: UserRoleEnum): string {
    const translatableRole = role.split('.')[1];
    return USER_ROLES_FR[translatableRole];
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
