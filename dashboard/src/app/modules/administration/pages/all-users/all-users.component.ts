import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { User } from '~/core/entities/authentication/user';
import { UserService } from '~/core/services/authentication/user.service';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { groupType } from '~/core/types/mainType';

@Component({
  selector: 'app-all-users',
  templateUrl: './all-users.component.html',
  styleUrls: ['./all-users.component.scss'],
})
export class AllUsersComponent extends DestroyObservable implements OnInit {
  usersToShow: User[];
  users: User[];
  searchFilters: FormGroup;
  showCreateUserForm = false;
  userGroup: groupType = 'territory';
  availableUserGroups: groupType[] = ['territory', 'operator', 'registry'];

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

  addUser() {
    this.showCreateUserForm = true;
  }

  closeUserForm() {
    this.showCreateUserForm = false;
  }

  private loadUsers() {
    console.log('-> loadUsers');
    this.userService.load({ group: this.userGroup }).subscribe(
      () => {},
      (err) => {
        // TODO TMP DELETE WHEN BACK IS LINKED
        const user1 = {
          firstname: 'Thomas',
          lastname: 'Durant',
          email: 'thomas.durant@beta.gouv.fr',
          group: 'territory',
        };
        const user2 = {
          firstname: 'Margot',
          lastname: 'Sanchez',
          email: 'margot.sanchez@beta.gouv.fr',
          group: 'territory',
        };
        const user3 = {
          firstname: 'John',
          lastname: 'Doe Admin',
          email: 'john.doe@beta.gouv.fr',
          group: 'registry',
        };
        const user4 = {
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
