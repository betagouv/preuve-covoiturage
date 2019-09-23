import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { REGEXP } from '~/core/const/validators.const';
import { UserService } from '~/core/services/authentication/user.service';
import { ProfileInterface } from '~/core/interfaces/user/profileInterface';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profile-edition',
  templateUrl: './profile-edition.component.html',
  styleUrls: ['./profile-edition.component.scss'],
})
export class ProfileEditionComponent extends DestroyObservable implements OnInit {
  public profileForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private _userService: UserService,
    private router: Router,
    private toastr: ToastrService,
  ) {
    super();
  }

  ngOnInit() {
    this.initProfilForm();
    this.initProfilFormValue();
  }

  get controls() {
    return this.profileForm.controls;
  }

  public onUpdateProfile(): void {
    console.log('> onUpdateProfile this.profileForm.value : ', this.profileForm.value);
    const userData = {
      _id: this._userService.user._id,
      ...this.profileForm.value,
      phone: this.profileForm.value.phone ? this.profileForm.value.phone : '',
    };
    if (!userData.phone) delete userData.phone;

    this._userService
      .patchOne(userData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.toastr.success('Votre profile as bien été mis à jour');
      });
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
