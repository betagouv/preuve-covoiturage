import { Component, OnInit } from '@angular/core';
import { DialogService } from 'primeng/api';

import { User } from '~/entities/database/user/user';
import { AuthenticationService } from '~/applicativeService/authentication/auth.service';
import { DIALOGSTYLE } from '~/config/dialog/dialogStyle';

import { UserService } from '../../../../services/userService';
import { ProfileEditionDialogComponent } from '../edition/component';

@Component({
  selector: 'app-profile',
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})
export class ProfileViewComponent implements OnInit {
  user: User;
  constructor(
    private usersService: UserService,
    private authentificationService: AuthenticationService,
    private dialogService: DialogService,
  ) {}

  ngOnInit() {
    this.user = this.authentificationService.getUser();
    if (this.user['_id']) {
      this.get();
    }
  }

  /**
   * get user from database
   */
  private get() {
    this.usersService.getOne(this.user['_id']).subscribe((user: User) => {
      this.set(user);
    });
  }

  /**
   * update display
   */
  private set(user) {
    this.user = user;
  }

  edit(user) {
    const config = {
      ...DIALOGSTYLE,
      header: 'Éditer votre profil',
      data: {
        id: user._id,
      },
    };

    const ref = this.dialogService.open(ProfileEditionDialogComponent, config);

    ref.onClose.subscribe(() => {
      this.get();
    });
  }
}
