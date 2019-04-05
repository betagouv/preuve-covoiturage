import { Component, OnInit, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

import { UserService } from '../../../../services/userService';
import { OPERATOR_MAIN } from '../../../../config/main';

@Component({
  selector: 'app-user-dropdown',
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})

export class UserDropdownComponent implements OnInit {
  @Input() userId: FormControl;
  public user;
  public users = [];
  public filteredUsers = [];

  constructor(
      private userService: UserService,
  ) {
  }

  public ngOnInit() {
    if (this.userId) {
      this.getUser();
    }
    this.getUsers();
  }

  public getUser() {
    if (this.userId) {
      this.userService.getOne(this.userId.value).subscribe((response) => {
        if (response[0]) {
          const item = response[0];
          this.user = {
            key: item._id,
            value: `${item.firstname} ${item.lastname}`,
          };
        }
      });
    }
  }

  public getUsers() {
    this.userService.get([['limit', OPERATOR_MAIN.operator_query_limit]]).subscribe((response) => {
      this.users = response.data.map((item) => {
        const normalizedItem = {
          key: item._id,
          value: `${item.firstname} ${item.lastname}`,
        };
        return normalizedItem;
      });
    });
  }

  public filter(event) {
    if (event && event.query) {
      const regexp = new RegExp(event.query);
      this.filteredUsers = this.users.filter(item => regexp.test(item.value));
    } else {
      this.filteredUsers = this.users.slice();
    }
  }

  public onSelect(user) {
    this.user = user;
    this.userId.setValue(user.key);
    this.userId.markAsDirty();
  }
}
