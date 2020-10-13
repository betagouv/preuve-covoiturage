import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil, tap, map } from 'rxjs/operators';
import { merge, Observable, of } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';

import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { User } from '~/core/entities/authentication/user';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { UserGroupEnum } from '~/core/enums/user/user-group.enum';
import { UserManyRoleEnum, UserRoleEnum } from '~/core/enums/user/user-role.enum';
import { UserStoreService } from '~/modules/user/services/user-store.service';
import { UserListInterface } from '~/core/entities/api/shared/user/common/interfaces/UserListInterface';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent extends DestroyObservable implements OnInit {
  usersToShow: UserListInterface[];
  users: UserListInterface[];
  usersFiltered: UserListInterface[];
  searchFilters: FormGroup;
  editUserFormVisible = false;
  editedUser = new User();
  canEditUser$: Observable<boolean>;
  isCreatingUser: boolean;
  PAGE_SIZE = 10;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  private users$: Observable<UserListInterface[]>;

  constructor(
    public authenticationService: AuthenticationService,
    public userStoreService: UserStoreService,
    private fb: FormBuilder,
  ) {
    super();
  }

  ngOnInit(): void {
    this.userStoreService.reset();
    this.userStoreService.filterSubject.next({ limit: 1000 });

    this.users$ = this.userStoreService.entities$.pipe(
      tap((users) => {
        this.users = users;
        this.usersToShow = users;
      }),
    );

    this.userStoreService.entity$
      .pipe(
        map((user) => !!user),
        takeUntil(this.destroy$),
      )
      .subscribe((editUserFormVisible) => (this.editUserFormVisible = editUserFormVisible));

    this.loadUsers();
    this.initSearchForm();

    this.canEditUser$ = this.authenticationService.hasAnyPermissionObs(['user.update']);
  }

  ngAfterViewInit(): void {
    merge(
      this.users$,
      this.searchFilters.valueChanges.pipe(tap(() => (this.paginator.pageIndex = 0))),
      this.paginator.page,
    )
      .pipe(
        distinctUntilChanged(),
        debounceTime(100),
        switchMap(() => {
          this.closeUserForm();
          const query = this.searchFilters ? this.searchFilters.controls.query.value : '';
          const page = this.paginator.pageIndex;
          const start = Number(page) * this.PAGE_SIZE;
          const end = Number(page) * this.PAGE_SIZE + this.PAGE_SIZE;
          this.usersFiltered = this.users
            .filter((u) => `${u.email} ${u.firstname} ${u.lastname}`.toLowerCase().includes(query.toLowerCase()))
            .sort((a, b) => a.firstname.localeCompare(b.firstname));
          return of(this.usersFiltered.slice(start, end));
        }),
      )
      .subscribe((filteredUsers) => {
        this.usersToShow = filteredUsers;
      });
  }

  get countUsers(): number {
    return this.usersFiltered && this.usersFiltered.length;
  }

  showEditForm(user: User = null): void {
    if (user) {
      this.userStoreService.select(user);
    } else {
      const newUser = new User();
      // newUser.group = this.userGroup;
      if (this.currentOperator) {
        newUser.group = this.currentGroup;
        newUser.operator_id = this.currentOperator;
        newUser.role = `${this.currentGroup}.'${UserManyRoleEnum.USER}` as UserRoleEnum;
      }
      if (this.currentTerritory) {
        newUser.group = this.currentGroup;
        newUser.territory_id = this.currentTerritory;
        newUser.role = `${this.currentGroup}.'${UserManyRoleEnum.USER}` as UserRoleEnum;
      }
      this.userStoreService.selectNew(newUser);
    }

    this.isCreatingUser = !user;

    // this.editForm.startEdit(this.isCreatingUser, true, editedUser);
  }

  closeUserForm(): void {
    this.editUserFormVisible = false;
  }

  get canToCreateUser(): boolean {
    return this.authenticationService.hasAnyPermission(['user.create', 'territory.users.add', 'operator.users.add']);
  }

  get currentGroup(): UserGroupEnum {
    return this.authenticationService.user.group;
  }

  get currentOperator(): number {
    return this.authenticationService.user.operator_id;
  }

  get currentTerritory(): number {
    return this.authenticationService.user.territory_id;
  }

  private loadUsers(): void {
    this.userStoreService.loadList();
  }

  private initSearchForm(): void {
    this.searchFilters = this.fb.group({
      query: [''],
    });

    this.searchFilters.valueChanges
      .pipe(takeUntil(this.destroy$), debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        if (!value) {
          return (this.usersToShow = this.users);
        }
        this.filterUsers();
      });
  }

  public filterUsers(): void {
    const query = this.searchFilters ? this.searchFilters.controls.query.value.toString().toLowerCase() : '';

    this.usersToShow = this.users.filter((u) =>
      `${u.email} ${u.firstname} ${u.lastname}`.toLowerCase().includes(query),
    );
  }
}
