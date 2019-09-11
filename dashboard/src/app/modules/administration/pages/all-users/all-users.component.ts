import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { User } from '~/core/entities/authentication/user';
import { UserService } from '~/core/services/authentication/user.service';
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
  searchFilters: FormGroup;
  editUserFormVisible = false;
  isCreatingUser = false;
  userGroup = 'territory';
  availableUserGroups = USER_GROUPS;

  @ViewChild(CreateEditUserFormComponent, { static: false }) editForm: CreateEditUserFormComponent;
  public editedUser: User;

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
      this.usersToShow = users;
    });
    // this.userGroupButtons.writeValue(this.userGroup);
    this.loadUsers();
    this.initSearchForm();
  }

  showEditForm(user: User = null) {
    this.editedUser =
      user === null
        ? new User({ group: this.userGroup }) // create a default user based on selected user group (top filter)
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
    return;
    console.log('-> loadUsers');
    this.userService.load().subscribe(
      (users) => {
        this.users = users;
        this.filterUsers();
      },
      (err) => {
        // TODO TMP DELETE WHEN BACK IS LINKED
        const user1 = {
          _id: 1,
          firstname: 'Thomas',
          lastname: 'Durant',
          email: 'thomas.durant@beta.gouv.fr',
          group: 'territory',
          operator: 1,
        };
        const user2 = {
          _id: 2,
          firstname: 'Margot',
          lastname: 'Sanchez',
          email: 'margot.sanchez@beta.gouv.fr',
          group: 'territory',
        };
        const user3 = {
          _id: 3,
          firstname: 'John',
          lastname: 'Doe Admin',
          email: 'john.doe@beta.gouv.fr',
          group: 'registry',
        };
        const user4 = {
          _id: 4,
          firstname: 'John',
          lastname: 'Doe OP',
          email: 'john.doe@beta.gouv.fr',
          group: 'operator',
        };

        this.userService._entities$.next(
          [new User(user1), new User(user2), new User(user3), new User(user4)].filter(
            (fUser) => fUser.group === this.userGroup,
          ),
        );
      },
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

  private filterUsers() {
    const query = this.searchFilters.controls.query.value;
    this.usersToShow = this.users.filter(
      (u) => u.email.includes(query) || `${u.firstname} ${u.lastname}`.includes(query),
    );
  }
}
