import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';

import { AuthenticationService } from '~/applicativeService/authentication/service';
import { regexp } from '~/entities/validators';
import { User } from '~/entities/database/user/user';

@Component({
  selector: 'app-auth-form-forgotten-password',
  templateUrl: 'template.html',
})

export class AuthFormForgottenPasswordComponent implements OnInit {
  public forgottenPasswordForm = this.fb.group({
    email: ['', [Validators.required, Validators.pattern(regexp.email)]],
  });

  public success: string;
  public loading = false;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authenticationService: AuthenticationService,
  ) {
  }

  ngOnInit(): void {
    //
  }

  onSubmit() {
    const user = new User();
    Object.keys(this.forgottenPasswordForm.controls).forEach((prop) => {
      if (this.forgottenPasswordForm.controls[prop].dirty) {
        user[prop] = this.forgottenPasswordForm.value[prop];
      }
    });
    this.sendEmailForNewPassword(user);
    this.submitted = true;
  }

  sendEmailForNewPassword(user: User) {
    this.loading = true;
    this.authenticationService.sendEmailForPasswordReset(user.email)
      .subscribe(
        () => {
          this.loading = false;
          this.router.navigate(['/signin'], { queryParams: { flash: 'password-sent' } });
        },
        () => {
          this.loading = false;
          // fix: do nothhing ?;
        },
      );
  }
}
