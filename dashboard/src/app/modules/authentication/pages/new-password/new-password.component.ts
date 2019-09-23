import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';

import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { PASSWORD } from '~/core/const/validators.const';
import { DestroyObservable } from '~/core/components/destroy-observable';

import { passwordMatchValidator } from '../../validators/password-match.validator';

@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.scss'],
})
export class NewPasswordComponent extends DestroyObservable implements OnInit {
  public newPasswordForm: FormGroup;
  // public reset: string;
  public token: string;
  public email: string;
  public hasError = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthenticationService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private router: Router,
  ) {
    super();
    this.token = this.activatedRoute.params['token'];
    this.email = this.activatedRoute.params['email'];
  }

  ngOnInit() {
    // this.checkToken();
    this.newPasswordForm = this.fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(PASSWORD.min), Validators.maxLength(PASSWORD.max)]],
        passwordVerification: [
          '',
          [Validators.required, Validators.minLength(PASSWORD.min), Validators.maxLength(PASSWORD.max)],
        ],
      },
      { validator: passwordMatchValidator },
    );
  }

  get password() {
    return this.newPasswordForm.get('password');
  }

  get passwordVerification() {
    return this.newPasswordForm.get('passwordVerification');
  }

  /**
   * Called on each input in either password field
   */
  public onPasswordInput(): void {
    if (this.newPasswordForm.hasError('passwordMismatch')) {
      const errors = this.passwordVerification.errors || {};
      this.passwordVerification.setErrors({
        ...errors,
        passwordMismatch: true,
      });
    } else {
      this.passwordVerification.setErrors(null);
    }
  }

  public changePassword(): void {
    this.authService
      .sendNewPassword(this.email, this.password.value, this.token)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.hasError = false;
          this.router.navigate(['/login']).then(() => {
            this.toastr.success('Votre mot de passe a été modifié');
          });
        },
        (error) => {
          this.hasError = true;
          this.toastr.error(
            'Une erreur est survenue lors de la réinitalisation de votre mot de passe, ' +
              'vérifier que vous avez bien ouvert le dernier email intitulé "Nouveau mot de passe ". ',
          );
        },
      );
  }
}
