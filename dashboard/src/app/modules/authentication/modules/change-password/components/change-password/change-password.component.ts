import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { PASSWORD } from '~/core/const/validators.const';
import { passwordMatchValidator } from '~/modules/authentication/validators/password-match.validator';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { catchHttpStatus } from '~/core/operators/catchHttpStatus';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent extends DestroyObservable implements OnInit {
  public changePasswordForm: FormGroup;
  public oldPasswordType = 'password';
  public passwordType = 'password';
  public confirmPasswordType = 'password';

  constructor(private fb: FormBuilder, private authentication: AuthenticationService, private toastr: ToastrService) {
    super();
  }

  ngOnInit(): void {
    this.initProfilForm();
  }

  get controls(): { [key: string]: AbstractControl } {
    return this.changePasswordForm.controls;
  }

  get password(): AbstractControl {
    return this.changePasswordForm.get('new_password');
  }

  get passwordVerification(): AbstractControl {
    return this.changePasswordForm.get('password_verification');
  }

  onChangePassword(): void {
    this.authentication
      .changePassword(this.changePasswordForm.value.old_password, this.changePasswordForm.value.new_password)
      .pipe(
        catchHttpStatus(403, (err) => {
          this.toastr.error('Ancien mot de passe non valide');
          return null;
        }),
        takeUntil(this.destroy$),
      )

      .subscribe(
        (result) => {
          if (!result) return;
          this.toastr.success('Votre mot de passe a été mis à jour');
          this.changePasswordForm.reset();
          Object.keys(this.changePasswordForm.controls).forEach((key) => {
            this.changePasswordForm.controls[key].setErrors(null);
          });
          // this.markAllControlsAsTouched(this.changePasswordForm);
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

  public onPasswordTypeToggle(index: 0 | 1 | 2): void {
    if (index === 0) {
      this.oldPasswordType = this.oldPasswordType === 'password' ? 'text' : 'password';
    } else if (index === 1) {
      this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
    } else {
      this.confirmPasswordType = this.confirmPasswordType === 'password' ? 'text' : 'password';
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
