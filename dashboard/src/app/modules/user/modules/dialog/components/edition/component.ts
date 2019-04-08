import { Component, OnInit } from '@angular/core';
import {
  DynamicDialogRef,
  DynamicDialogConfig,
} from 'primeng/api';


import { TranslationService } from '~/shared/services/translationService';
import { AuthenticationService } from '~/applicativeService/authentication/service';
import { User } from '~/entities/database/user/user';


import { UserService } from '../../../../services/userService';


@Component({
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})

export class UserEditionDialogComponent implements OnInit {
  public user;
  loaded = false;


  constructor(
    private translationService: TranslationService,
    private authentificationService: AuthenticationService,
    private userService: UserService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
  ) {
  }

  ngOnInit() {
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
