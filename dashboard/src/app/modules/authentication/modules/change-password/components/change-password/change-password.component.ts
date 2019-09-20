import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { PASSWORD } from '~/core/const/validators.const';
import { passwordMatchValidator } from '~/modules/authentication/validators/password-match.validator';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent implements OnInit {
  public changePasswordForm: FormGroup;

  constructor(private fb: FormBuilder, private authentication: AuthenticationService) {}

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
    this.authentication.changePassword(
      this.changePasswordForm.value.old_password,
      this.changePasswordForm.value.new_password,
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
