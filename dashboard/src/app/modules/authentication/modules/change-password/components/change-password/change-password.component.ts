import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { PASSWORD } from '~/core/const/validators.const';
import { passwordMatchValidator } from '~/modules/authentication/validators/password-match.validator';
import { takeUntil } from 'rxjs/operators';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent extends DestroyObservable implements OnInit {
  public changePasswordForm: FormGroup;

  constructor(private fb: FormBuilder, private authentication: AuthenticationService, private toastr: ToastrService) {
    super();
  }

  ngOnInit(): void {
    this.initProfilForm();
  }

  get controls() {
    return this.changePasswordForm.controls;
  }

  get password() {
    return this.changePasswordForm.get('new_password');
  }

  get passwordVerification() {
    return this.changePasswordForm.get('password_verification');
  }

  onChangePassword(): void {
    this.authentication
      .changePassword(this.changePasswordForm.value.old_password, this.changePasswordForm.value.new_password)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (result) => {
          this.toastr.success('Votre mot de passe a été mis à jour');
          this.changePasswordForm.setValue({
            old_password: '',
            new_password: '',
            verif_password: '',
          });
        },
        (err) => {
          this.toastr.error(err.message);
        },
      );
  }

  /**
   * Called on each input in either password field
   */
  public onPasswordInput(): void {
    if (this.changePasswordForm.hasError('passwordMismatch')) {
      const errors = this.passwordVerification.errors || {};
      this.passwordVerification.setErrors({
        ...errors,
        passwordMismatch: true,
      });
    } else {
      this.passwordVerification.setErrors(null);
    }
  }

  private initProfilForm(): void {
    this.changePasswordForm = this.fb.group(
      {
        old_password: [
          '',
          [Validators.required, Validators.minLength(PASSWORD.min), Validators.maxLength(PASSWORD.max)],
        ],
        new_password: [
          '',
          [Validators.required, Validators.minLength(PASSWORD.min), Validators.maxLength(PASSWORD.max)],
        ],
        password_verification: [
          '',
          [Validators.required, Validators.minLength(PASSWORD.min), Validators.maxLength(PASSWORD.max)],
        ],
      },
      { validator: passwordMatchValidator },
    );
  }
}
