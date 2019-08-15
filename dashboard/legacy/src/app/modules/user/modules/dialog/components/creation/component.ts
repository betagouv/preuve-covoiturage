import { Component, OnInit } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/api';

import { User } from '~/entities/database/user/user';

import { UserService } from '../../../../services/userService';

@Component({
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})
export class UserCreationDialogComponent {
  public loading = false;

  constructor(private userService: UserService, public ref: DynamicDialogRef, public config: DynamicDialogConfig) {}

  public addUser(user: User) {
    this.loading = true;
    this.userService.post(user).subscribe(
      (response) => {
        this.loading = false;
        this.ref.close(response);
      },
      () => {
        this.loading = false;
      },
    );
  }
}
