import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

import { User } from '~/entities/database/user/user';

@Component({
  selector: 'app-user-dropdown',
  templateUrl: 'template.html',
})

export class UserDropdownComponent implements OnInit {
  formattedUsers: { key: string, value: string }[];
  formattedUser: { key: string, value: string } = null;

  @Input() user: FormControl;
  @Input()
  set users(users: User[]) {
    if (users) {
      this.formattedUsers = users.map((user: User) => { // tslint:disable-line ter-arrow-body-style
        return {
          key: user._id,
          value: `${user.firstname} ${user.lastname}`,
        };
      });
    }
  }

  public filteredUsers: { key: string, value: string }[] = [];

  public ngOnInit() {
    if (this.user && this.user.value) {
      this.formattedUser = { key: this.user.value._id, value: `${this.user.value.firstname} ${this.user.value.lastname}` };
    }
  }

  public filter(event) {
    if (event && event.query) {
      const regexp = new RegExp(event.query, 'i');
      this.filteredUsers = this.formattedUsers.filter(item => regexp.test(item.value));
    } else {
      this.filteredUsers = this.formattedUsers.slice();
    }
  }

  public onSelect(user) {
    this.formattedUser = user;
    this.user.setValue(user.key);
    this.user.markAsDirty();
  }
}
