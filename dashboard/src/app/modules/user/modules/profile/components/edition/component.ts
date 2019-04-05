import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/api';

import { User } from '~/entities/database/user';

import { UserService } from '../../../../services/userService';


@Component({
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})

export class ProfileEditionDialogComponent implements OnInit {
  public user;
  loaded = false;

  constructor(
      private userService: UserService,
      public ref: DynamicDialogRef,
      public config: DynamicDialogConfig,
  ) {

  }

  ngOnInit(): void {
    this.user = new User();
    const { id } = this.config.data;
    this.userService.getOne(id).subscribe((user: [object]) => {
      this.user = user;
      this.loaded = true;
    });
  }

  public edit(patch) {
    this.userService.patch(this.user._id, patch).subscribe((user:User) => {
      this.user = user;
      this.ref.close();
    });
  }
}
