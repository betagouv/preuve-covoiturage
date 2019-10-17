import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { User } from '~/core/entities/authentication/user';
import { UserService } from '~/modules/user/services/user.service';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { USER_GROUPS, USER_GROUPS_FR, UserGroupEnum } from '~/core/enums/user/user-group.enum';
// tslint:disable-next-line: max-line-length
import { CreateEditUserFormComponent } from '~/modules/user/modules/ui-user/components/create-edit-user-form/create-edit-user-form.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-all-users',
  templateUrl: './all-users.component.html',
  styleUrls: ['./all-users.component.scss'],
})
export class AllUsersComponent extends DestroyObservable implements OnInit {
  usersToShow: User[];
  users: User[];
  searchFilters: FormGroup;
  editUserFormVisible = false;
  isCreatingUser = false;
  userGroup = UserGroupEnum.TERRITORY;
  availableUserGroups = USER_GROUPS;

  @ViewChild(CreateEditUserFormComponent, { static: false }) editForm: CreateEditUserFormComponent;
  public editedUser: User;
  canEditUser$: Observable<boolean>;

  constructor(
    public authenticationService: AuthenticationService,
    public userService: UserService,
    private fb: FormBuilder,
    private toastr: ToastrService,
  ) {
    super();
  }

  ngOnInit() {
    // listen to user list
    this.userService.entities$.pipe(takeUntil(this.destroy$)).subscribe((users) => {
      this.users = users;
      this.filterUsers();
    });
    // this.userGroupButtons.writeValue(this.userGroup);
    this.loadUsers();
    this.initSearchForm();

    this.canEditUser$ = this.authenticationService.hasAnyPermissionObs(['user.update']);
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

  loadUsers() {
    this.userService.load().subscribe(
      (users) => {
        this.users = users;
        this.filterUsers();
      },
      (err) => {},
    );
  }

  private initSearchForm() {
    this.searchFilters = this.fb.group({
      query: [''],
    });

    this.searchFilters.valueChanges
      .pipe(
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
    const query = this.searchFilters ? this.searchFilters.controls.query.value : '';
    this.usersToShow = this.users.filter(
      (u) => (u.email.includes(query) || `${u.firstname} ${u.lastname}`.includes(query)) && this.userGroup === u.group,
    );
  }
}
