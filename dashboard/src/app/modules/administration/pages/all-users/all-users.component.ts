import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { forkJoin, merge, Observable, of } from 'rxjs';
import { MatButtonToggleGroup, MatPaginator } from '@angular/material';

import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { User } from '~/core/entities/authentication/user';
import { UserService } from '~/modules/user/services/user.service';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { USER_GROUPS, USER_GROUPS_FR, UserGroupEnum } from '~/core/enums/user/user-group.enum';
// tslint:disable-next-line: max-line-length
import { CreateEditUserFormComponent } from '~/modules/user/modules/ui-user/components/create-edit-user-form/create-edit-user-form.component';

@Component({
  selector: 'app-all-users',
  templateUrl: './all-users.component.html',
  styleUrls: ['./all-users.component.scss'],
})
export class AllUsersComponent extends DestroyObservable implements OnInit {
  usersToShow: User[];
  users: User[];
  usersFiltered: User[];

  searchFilters: FormGroup;
  editUserFormVisible = false;
  isCreatingUser = false;
  userGroup = UserGroupEnum.TERRITORY;
  availableUserGroups = USER_GROUPS;
  PAGE_SIZE = 10;

  @ViewChild(CreateEditUserFormComponent, { static: false }) editForm: CreateEditUserFormComponent;
  @ViewChild(MatButtonToggleGroup, { static: false }) toggle: MatButtonToggleGroup;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  public editedUser: User;
  canEditUser$: Observable<boolean>;

  constructor(
    public authenticationService: AuthenticationService,
    public userService: UserService,
    private fb: FormBuilder,
  ) {
    super();
  }

  ngOnInit() {
    // listen to user list
    this.userService.entities$.pipe(takeUntil(this.destroy$)).subscribe((users) => {
      this.users = users;
    });
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
          this.usersFiltered = this.users.filter(
            (u) =>
              `${u.email} ${u.firstname} ${u.lastname}`.toLowerCase().includes(query.toLowerCase()) &&
              this.userGroup === u.group &&
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
    return this.usersFiltered && this.usersFiltered.filter((user) => user.group === this.userGroup).length;
  }

  showEditForm(user: User = null) {
    const emptyUserWithGroup = new User();
    emptyUserWithGroup.group = this.userGroup;
    this.editedUser =
      user === null
        ? emptyUserWithGroup // create a default user based on selected user group (top filter)
        : new User(user);

    this.isCreatingUser = !this.editedUser._id;
    this.editUserFormVisible = true;

    // this.editForm.startEdit(this.isCreatingUser, true, editedUser);
  }

  closeUserForm() {
    this.editUserFormVisible = false;
  }

  getFrenchGroup(group: UserGroupEnum): string {
    return USER_GROUPS_FR[group];
  }

  private loadUsers() {
    this.userService.load().subscribe();
  }

  private initSearchForm() {
    this.searchFilters = this.fb.group({
      query: [''],
    });
  }
}
