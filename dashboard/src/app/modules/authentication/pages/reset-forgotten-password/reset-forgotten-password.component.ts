import { Component, OnInit } from '@angular/core';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { ToastrService } from 'ngx-toastr';
import { PASSWORD } from '~/core/const/validators.const';
import { passwordMatchValidator } from '~/modules/authentication/validators/password-match.validator';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-reset-forgotten-password',
  templateUrl: './reset-forgotten-password.component.html',
  styleUrls: ['./reset-forgotten-password.component.scss'],
})
export class ResetForgottenPasswordComponent extends DestroyObservable implements OnInit {
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
  }

  ngOnInit() {
    // this.checkToken();
    this.token = this.activatedRoute.snapshot.params['token'];
    this.email = this.activatedRoute.snapshot.params['email'];

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
      .restorePassword(this.email, this.password.value, this.token)
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
