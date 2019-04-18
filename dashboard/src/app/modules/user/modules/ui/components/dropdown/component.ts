import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-user-dropdown',
  templateUrl: 'template.html',
})

export class UserDropdownComponent implements OnInit {
  @Input() userId: FormControl;
  @Input() users: { key: string, value: string }[];

  public user: { key: string, value: string } = null;
  public filteredUsers: { key: string, value: string }[] = [];

  public ngOnInit() {
    if (this.userId && this.userId.value) {
      this.user = this.userId.value;
    }
  }

  public filter(event) {
    if (event && event.query) {
      const regexp = new RegExp(event.query, 'i');
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
