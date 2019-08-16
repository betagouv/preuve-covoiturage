import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { password } from '~/core/config/validators';

import { passwordMatchValidator } from '../../validators/password-match.validator';

@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.scss'],
})
export class NewPasswordComponent implements OnInit {
  public newPasswordForm: FormGroup;
  public reset: string;
  public token: string;
  public hasError = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthenticationService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.checkToken();
    this.newPasswordForm = this.fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(password.min), Validators.maxLength(password.max)]],
        passwordVerification: [
          '',
          [Validators.required, Validators.minLength(password.min), Validators.maxLength(password.max)],
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
   * Get token and reset from url and verify that they are valid
   */
  private checkToken() {
    this.activatedRoute.paramMap.subscribe((params: Params) => {
      const token = params.get('token');
      const reset = params.get('reset');
      this.authService.checkPasswordToken(reset, token).subscribe(
        () => {
          this.hasError = false;
          this.token = token;
          this.reset = reset;
        },
        () => {
          this.hasError = true;
          this.toastr.error(
            'Une erreur est survenue lors de la réinitalisation de votre mot de passe, ' +
              'vérifier que vous avez bien ouvert le dernier email intitulé "Nouveau mot de passe ". ',
          );
        },
      );
    });
  }

  /**
   * Called on each input in either password field
   */
  public onPasswordInput(): void {
    console.log(this.password);
    if (this.newPasswordForm.hasError('passwordMismatch')) {
      this.passwordVerification.setErrors([{ passwordMismatch: true }]);
    } else {
      this.passwordVerification.setErrors(null);
    }
  }

  public changePassword(): void {
    this.authService.sendNewPassword(this.newPasswordForm.controls.password.value, this.reset, this.token).subscribe(
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
