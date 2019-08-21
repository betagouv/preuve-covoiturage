import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { REGEXP } from '~/core/const/validators.const';
import { UserService } from '~/core/services/authentication/user.service';
import { ProfileInterface } from '~/core/interfaces/user/profileInterface';

import { ProfileService } from '../../../../services/profile.service';

@Component({
  selector: 'app-profile-edition',
  templateUrl: './profile-edition.component.html',
  styleUrls: ['./profile-edition.component.scss'],
})
export class ProfileEditionComponent implements OnInit {
  public profileForm: FormGroup;

  constructor(private fb: FormBuilder, private profileService: ProfileService, private _userService: UserService) {}

  ngOnInit() {
    this.initProfilForm();
    this.initProfilFormValue();
  }

  get controls() {
    return this.profileForm.controls;
  }

  public onUpdateProfile(): void {
    this.profileService.patch(this.profileForm.value);
  }

  private initProfilFormValue(): void {
    const { firstname, lastname, email, phone } = <ProfileInterface>this._userService.user;
    this.profileForm.setValue({ firstname, lastname, email, phone });
  }

  private initProfilForm(): void {
    this.profileForm = this.fb.group({
      firstname: [null, Validators.required],
      lastname: [null, Validators.required],
      email: [null, [Validators.required, Validators.pattern(REGEXP.email)]],
      phone: [null, Validators.pattern(REGEXP.phone)],
    });
  }
}
