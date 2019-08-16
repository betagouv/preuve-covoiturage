import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { MAIN } from '~/core/const/main.const';
import { password } from '~/core/config/validators';

import { passwordMatchValidator } from '../../validators/password-match.validator';

@Component({
  templateUrl: './invite-email.component.html',
  styleUrls: ['./invite-email.component.scss'],
})
export class InviteEmailComponent implements OnInit {
  public confirm = '';
  public token = '';
  public newPasswordForm: FormGroup;
  public hasError = false;
  public isSuccess = false;
  public contactEmail = MAIN.contactEmail;

  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthenticationService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.confirmEmail();
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

  confirmEmail(): void {
    this.activatedRoute.paramMap.subscribe((params: Params) => {
      this.confirm = params.get('confirm');
      this.token = params.get('token');

      this.authService.checkEmailToken(this.confirm, this.token).subscribe(
        () => {
          this.isSuccess = true;
          this.toastr.success('Vous pouvez créer votre mot de passe', 'Email confirmé');
        },
        (error) => {
          this.hasError = true;
          this.toastr.error('Email non confirmé');
        },
      );
    });
  }

  /**
   * Called on each input in either password field
   */
  public onPasswordInput(): void {
    if (this.newPasswordForm.hasError('passwordMismatch')) {
      this.passwordVerification.setErrors([{ passwordMismatch: true }]);
    } else {
      this.passwordVerification.setErrors(null);
    }
  }

  public changePassword(): void {
    this.authService.sendNewPassword(this.newPasswordForm.controls.password.value, this.confirm, this.token).subscribe(
      (data) => {
        this.hasError = false;
        this.router.navigate(['/login']).then(() => {
          this.toastr.success('Votre mot de passe a été créé');
        });
      },
      (error) => {
        this.hasError = true;
        this.toastr.error('Une erreur est survenue lors de la création de votre mot de passe.');
      },
    );
  }
}
