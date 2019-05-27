import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';

import { AuthenticationService } from '~/applicativeService/authentication/auth.service';
import { password } from '~/entities/validators';
import { User } from '~/entities/database/user/user';

@Component({
  selector: 'app-auth-form-new-password',
  templateUrl: 'template.html',
})
export class AuthFormNewPasswordComponent implements OnInit {
  public resetPasswordForm = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(password.min), Validators.maxLength(password.max)]],
  });

  private token: string;
  private reset: string;
  public loading = false;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authenticationService: AuthenticationService,
    private activatedRoute: ActivatedRoute,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.authenticationService.logout();
    this.getToken();
  }

  getToken() {
    this.activatedRoute.paramMap.subscribe((params: Params) => {
      const token = params.get('token');
      const reset = params.get('reset');
      if (params && token && reset) {
        this.authenticationService.checkPasswordToken(reset, token).subscribe(
          () => {
            this.token = token;
            this.reset = reset;
          },
          () => {
            this.messageService.add({
              severity: 'error',
              summary:
                'Une erreur est survenue lors de la réinitalisation de votre mot de passe, ' +
                'vérifier que vous avez bien ouvert le dernier email intitulé "Nouveau mot de passe ". ',
            });
          },
        );
      } else {
        this.messageService.add({
          severity: 'error',
          summary:
            'Une erreur est survenue lors de la réinitalisation de votre mot de passe, ' +
            'vérifier que vous avez bien ouvert le dernier email intitulé "Nouveau mot de passe ". ',
        });
      }
    });
  }

  onSubmit() {
    const user = new User();
    Object.keys(this.resetPasswordForm.controls).forEach((prop) => {
      if (this.resetPasswordForm.controls[prop].dirty) {
        user[prop] = this.resetPasswordForm.value[prop];
      }
    });
    this.setNewPassword(user);
    this.submitted = true;
  }

  setNewPassword(user: User) {
    if (this.token) {
      this.loading = true;
      this.authenticationService.postNewPassword(this.reset, this.token, user.password).subscribe(
        () => {
          this.loading = false;
          this.router.navigate(['/signin'], { queryParams: { flash: 'password-changed' } });
        },
        () => {
          this.loading = false;

          // fix: do nothhing ?;
        },
      );
    }
  }
}
