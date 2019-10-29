import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil, tap } from 'rxjs/operators';
import { merge, Observable, of } from 'rxjs';
import { MatPaginator } from '@angular/material';

import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { User } from '~/core/entities/authentication/user';
import { UserService } from '~/modules/user/services/user.service';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { UserGroupEnum } from '~/core/enums/user/user-group.enum';
import { UserRoleEnum } from '~/core/enums/user/user-role.enum';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent extends DestroyObservable implements OnInit {
  usersToShow: User[];
  users: User[];
  usersFiltered: User[];
  searchFilters: FormGroup;
  editUserFormVisible = false;
  editedUser = new User();
  canEditUser$: Observable<boolean>;
  isCreatingUser: boolean;
  PAGE_SIZE = 10;

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  constructor(
    public authenticationService: AuthenticationService,
    public userService: UserService,
    private fb: FormBuilder,
  ) {
    super();
  }

  ngOnInit() {
    this.loadUsers();
    this.initSearchForm();

    this.canEditUser$ = this.authenticationService.hasAnyPermissionObs(['user.update']);
  }

  ngAfterViewInit() {
    merge(
      this.userService.entities$,
      this.searchFilters.valueChanges.pipe(
        debounceTime(300),
        tap(() => (this.paginator.pageIndex = 0)),
      ),
      this.paginator.page,
    )
      .pipe(
        distinctUntilChanged(),
        switchMap(() => {
          this.closeUserForm();
          const query = this.searchFilters ? this.searchFilters.controls.query.value : '';
          const page = this.paginator.pageIndex;
          const start = Number(page) * this.PAGE_SIZE;
          const end = Number(page) * this.PAGE_SIZE + this.PAGE_SIZE;
          this.usersFiltered = this.users.filter(
            (u) =>
              `${u.email} ${u.firstname} ${u.lastname}`.toLowerCase().includes(query.toLowerCase()) &&
              this.authenticationService.user._id !== u._id,
          );
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

  addUser() {
    this.isCreatingUser = true;

    this.editUserFormVisible = true;
    if (this.currentOperator) {
      this.editedUser = new User({
        _id: null,
        email: null,
        firstname: null,
        lastname: null,
        phone: null,
        group: this.currentGroup,
        operator: this.currentOperator,
        role: UserRoleEnum.USER,
        permissions: [],
      });
      console.log(this.editedUser);
    }
    if (this.currentTerritory) {
      console.log('territory', this.currentTerritory);
      this.editedUser = new User({
        _id: null,
        email: null,
        firstname: null,
        lastname: null,
        phone: null,
        group: this.currentGroup,
        territory: this.currentTerritory,
        role: UserRoleEnum.USER,
        permissions: [],
      });
    }
  }

  showEditForm(user: User = null) {
    this.isCreatingUser = false;
    this.editUserFormVisible = true;
    this.editedUser = user;

    // this.editForm.startEdit(this.isCreatingUser, true, editedUser);
  }

  closeUserForm() {
    this.editUserFormVisible = false;
  }

  get canToCreateUser(): boolean {
    return this.authenticationService.hasAnyPermission(['user.create', 'territory.users.add', 'operator.users.add']);
  }

  get currentGroup(): UserGroupEnum {
    return this.authenticationService.user.group;
  }

  get currentOperator(): string {
    return this.authenticationService.user.operator;
  }

  get currentTerritory(): string {
    return this.authenticationService.user.territory;
  }

  private loadUsers() {
    this.userService
      .load()
      .pipe(takeUntil(this.destroy$))
      .subscribe();
    this.userService.entities$.pipe(takeUntil(this.destroy$)).subscribe((users) => {
      this.users = users;
      this.usersToShow = users;
    });
  }

  private initSearchForm() {
    this.searchFilters = this.fb.group({
      query: [''],
    });

    this.searchFilters.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged(),
      )
      .subscribe((value) => {
        if (!value) {
          return (this.usersToShow = this.users);
        }
        this.filterUsers();
      });
  }

  public filterUsers() {
    const query = this.searchFilters ? this.searchFilters.controls.query.value.toString().toLowerCase() : '';

    this.usersToShow = this.users.filter((u) =>
      `${u.email} ${u.firstname} ${u.lastname}`.toLowerCase().includes(query),
    );
  }
}
