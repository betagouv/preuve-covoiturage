import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { takeUntil } from 'rxjs/operators';

import { User } from '~/core/entities/authentication/user';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { USER_ROLES_FR, UserRoleEnum } from '~/core/enums/user/user-role.enum';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { DialogService } from '~/core/services/dialog.service';
import { UserStoreService } from '~/modules/user/services/user-store.service';
import { CommonDataService } from '~/core/services/common-data.service';
import { UserGroupEnum } from '~/core/enums/user/user-group.enum';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss'],
})
export class UsersListComponent extends DestroyObservable implements OnInit, AfterViewInit, OnChanges {
  @Input() users: User[] = [];
  @Input() userGroup: UserGroupEnum;
  @Input() canEditUser = false;
  @Output() editUser = new EventEmitter<User>();

  displayedColumns: string[] = ['name', 'email', 'role', 'actions'];

  constructor(
    public userStoreService: UserStoreService,
    public authService: AuthenticationService,
    private toastr: ToastrService,
    private dialogService: DialogService,
    private _commonDataService: CommonDataService,
  ) {
    super();
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if ('userGroup' in changes) {
      if (this.userGroup === UserGroupEnum.OPERATOR) {
        this.displayedColumns = ['name', 'email', 'operator', 'role', 'actions'];
      } else if (this.userGroup === UserGroupEnum.TERRITORY) {
        this.displayedColumns = ['name', 'email', 'territory', 'role', 'actions'];
      } else {
        this.displayedColumns = ['name', 'email', 'role', 'actions'];
      }
    }
  }

  get isOperator(): boolean {
    if (!this.userGroup) {
      return false;
    }
    return this.userGroup === UserGroupEnum.OPERATOR;
  }

  get isTerritory(): boolean {
    if (!this.userGroup) {
      return false;
    }
    return this.userGroup === UserGroupEnum.TERRITORY;
  }

  onDelete(user: User): void {
    this.dialogService
      .confirm({
        title: 'Voulez-vous supprimer cet utilisateur ?',
        confirmBtn: 'Oui',
        cancelBtn: 'Non',
        color: 'warn',
      })
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

  public getOperatorName(user: User): string {
    const foundOperator = this._commonDataService.operators.find((operator) => operator._id === user.operator_id);
    if (!foundOperator) {
      console.error('Operator not found !');
      return '';
    }
    return foundOperator.name;
  }

  public getTerritoryName(user: User): string {
    const foundTerritory = this._commonDataService.territories.find((territory) => territory._id === user.territory_id);
    if (!foundTerritory) {
      console.error('Territory not found !');
      return '';
    }
    return foundTerritory.name;
  }

  public onSendInvitation(user: User): void {
    this.authService
      .sendInviteEmail(user)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.toastr.success(`L'utilisateur ${user.firstname} ${user.lastname} va recevoir une nouvelle invitation`);
      });
  }

  public onEdit(user: User): void {
    this.editUser.emit(user);
  }
}
