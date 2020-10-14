import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { takeUntil, filter } from 'rxjs/operators';

import { REGEXP } from '~/core/const/validators.const';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { UserApiService } from '~/modules/user/services/user-api.service';
import { UserStoreService } from '~/modules/user/services/user-store.service';

@Component({
  selector: 'app-profile-edition',
  templateUrl: './profile-edition.component.html',
  styleUrls: ['./profile-edition.component.scss'],
})
export class ProfileEditionComponent extends DestroyObservable implements OnInit {
  public profileForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private userApiService: UserApiService,
    private userStoreService: UserStoreService,
    private router: Router,
    private toastr: ToastrService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initProfilForm();
    this.initProfilFormValue();
  }

  get controls(): { [key: string]: AbstractControl } {
    return this.profileForm.controls;
  }

  public onUpdateProfile(): void {
    const user = this.authService.user;
    // initProfilFormValue
    this.userApiService
      .patch(user._id, {
        ...this.profileForm.value,
        phone: this.profileForm.value.phone ? this.profileForm.value.phone : null,
      })

      .subscribe((updatedUser) => {
        this.toastr.success('Votre profil a bien été mis à jour');
      });
  }

  private initProfilFormValue(): void {
    this.authService.user$
      .pipe(
        filter((user) => !!user),
        takeUntil(this.destroy$),
      )
      .subscribe((user) => {
        const profileFormValues = this.authService.user.toFormValues();
        delete profileFormValues.role;
        delete profileFormValues.group;
        delete profileFormValues.territory_id;
        delete profileFormValues.operator_id;
        this.profileForm.setValue(profileFormValues);
      });
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
