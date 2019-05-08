import { Component, OnInit } from '@angular/core';

import { User } from '~/entities/database/user/user';
import { PROFIL_DATA } from '~/config/user/profilData';
import { TranslationService } from '~/shared/services/translationService';
import { AuthenticationService } from '~/applicativeService/authentication/service';
import { EditResponse } from '~/entities/responses/editResponse';

import { UserService } from '../../services/userService';


@Component({
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})

export class UserSettingsComponent implements OnInit {
  public user: User;
  public headList = PROFIL_DATA.data;
  public editableTypes: {} = PROFIL_DATA.editInputType;
  public values = {};


  constructor(private translationService: TranslationService,
              private authentificationService: AuthenticationService,
              private usersService: UserService,
  ) {
    this.resetValues();
  }

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
   * update local storage and display
   */
  private set(user) {
    this.user = user;
    this.setValues();
    // this.authentificationService.setUser(user); //todo: see if this works again
  }

  public edit(answer: EditResponse, head: string) {
    this.usersService.put(this.user, head, answer.value).subscribe((response) => {
      this.get();
    });
  }

  public isEditable(head: string): boolean {
    return (PROFIL_DATA.editable && PROFIL_DATA.editable.includes(head));
  }


  public hasPermission(permission: string): boolean {
    return this.authentificationService.hasPermission(permission);
  }

  public setValues(): void {
    for (const option of this.headList) {
      this.values[option] = this.translationService.getTableValue(this.user, option);
    }
  }

  public resetValues(): void {
    for (const option of this.headList) {
      this.values[option] = null;
    }
  }

  public getKey(key: string): string {
    return this.translationService.getTableKey(key);
  }
}
