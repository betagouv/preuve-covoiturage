import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { merge, Observable, of } from 'rxjs';
import { MatButtonToggleGroup, MatPaginator } from '@angular/material';

import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { User } from '~/core/entities/authentication/user';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { USER_GROUPS, USER_GROUPS_FR, UserGroupEnum } from '~/core/enums/user/user-group.enum';
// tslint:disable-next-line: max-line-length
import { CreateEditUserFormComponent } from '~/modules/user/modules/ui-user/components/create-edit-user-form/create-edit-user-form.component';
import { UserStoreService } from '~/modules/user/services/user-store.service';
import { UserListInterface } from '~/core/entities/api/shared/user/common/interfaces/UserListInterface';

@Component({
  selector: 'app-all-users',
  templateUrl: './all-users.component.html',
  styleUrls: ['./all-users.component.scss'],
})
export class AllUsersComponent extends DestroyObservable implements OnInit {
  usersToShow: UserListInterface[];
  users: UserListInterface[];
  usersFiltered: UserListInterface[];

  searchFilters: FormGroup;
  editUserFormVisible = false;
  isCreatingUser = false;
  userGroup = UserGroupEnum.TERRITORY;
  availableUserGroups = USER_GROUPS;
  PAGE_SIZE = 10;
  @ViewChild(CreateEditUserFormComponent, { static: false }) editForm: CreateEditUserFormComponent;
  @ViewChild(MatButtonToggleGroup, { static: false }) toggle: MatButtonToggleGroup;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  users$: Observable<UserListInterface[]>;

  public editedUser: User;
  canEditUser$: Observable<boolean>;

  constructor(
    public authenticationService: AuthenticationService,
    public userStoreService: UserStoreService,
    private fb: FormBuilder,
  ) {
    super();
  }

  ngOnInit() {
    this.userStoreService.reset();
    this.userStoreService.filterSubject.next({ limit: 1000 });

    // listen to user list
    this.users$ = this.userStoreService.entities$.pipe(tap((users) => (this.users = users)));

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

  ngAfterViewInit() {
    merge(
      this.users$,
      this.searchFilters.valueChanges.pipe(
        debounceTime(300),
        tap(() => (this.paginator.pageIndex = 0)),
      ),
      this.toggle.change.pipe(tap(() => (this.paginator.pageIndex = 0))),
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
          this.usersFiltered = this.users
            .filter(
              (u) =>
                `${u.email} ${u.firstname} ${u.lastname}`.toLowerCase().includes(query.toLowerCase()) &&
                this.userGroup === u.group,
            )
            .sort((a, b) => a.firstname.localeCompare(b.firstname));
          return of(this.usersFiltered.slice(start, end));
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((filteredUsers) => {
        this.usersToShow = filteredUsers;
      });
  }

  get countUsers(): number {
    return this.usersFiltered && this.usersFiltered.length;
  }

  showEditForm(user?: User) {
    if (user) {
      this.userStoreService.select(user);
    } else {
      const newUser = new User();
      newUser.group = this.userGroup;
      this.userStoreService.selectNew(newUser);
    }

    this.isCreatingUser = !user;
  }

  closeUserForm() {
    this.editUserFormVisible = false;
  }

  getFrenchGroup(group: UserGroupEnum): string {
    return USER_GROUPS_FR[group];
  }

  private loadUsers() {
    this.userStoreService.loadList();
  }

  private initSearchForm() {
    this.searchFilters = this.fb.group({
      query: [''],
    });
  }
}
