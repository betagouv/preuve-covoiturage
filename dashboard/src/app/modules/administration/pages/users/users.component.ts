import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { User } from '~/core/entities/authentication/user';
import { UserService } from '~/core/services/authentication/user.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  usersToShow: User[];
  users: User[];
  searchFilters: FormGroup;
  showCreateUserForm = false;

  constructor(
    public authenticationService: AuthenticationService,
    public userService: UserService,
    private fb: FormBuilder,
    private toastr: ToastrService,
  ) {}

  ngOnInit() {
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
    this.userService.load().subscribe(
      () => {},
      (err) => {
        // TODO TMP DELETE WHEN BACK IS LINKED
        const user1 = {
          firstname: 'Thomas',
          lastname: 'Durant',
          email: 'thomas.durant@beta.gouv.fr',
          role: 'Utilisateur',
        };
        const user2 = {
          firstname: 'Margot',
          lastname: 'Sanchez',
          email: 'margot.sanchez@beta.gouv.fr',
          role: 'Administrateur',
        };
        const user3 = {
          firstname: 'John',
          lastname: 'Doe',
          email: 'john.doe@beta.gouv.fr',
          role: 'Utilisateur',
        };
        this.userService._entities$.next([new User(user1), new User(user2), new User(user3)]);
      },
    );
    this.userService.entities$.subscribe((users) => {
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
