import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';

import { AuthenticationService } from '~/applicativeService/authentication/service';
import { password, regexp } from '~/entities/validators';
import { User } from '~/entities/database/user/user';

@Component({
  selector: 'app-auth-form-signin',
  templateUrl: 'template.html',
})

export class AuthFormSigninComponent implements OnInit {
  public signinForm = this.fb.group({
    email: ['', [Validators.required, Validators.pattern(regexp.email)]],
    password: ['', [Validators.required, Validators.minLength(password.min), Validators.maxLength(password.max)]],

  });

  model: any = {};
  loading = false;
  error = '';
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authenticationService: AuthenticationService,
  ) {
  }

  ngOnInit(): void {
    this.authenticationService.logout();
  }

  onSubmit() {
    const user = new User();
    Object.keys(this.signinForm.controls).forEach((prop) => {
      if (this.signinForm.controls[prop].dirty) {
        user[prop] = this.signinForm.value[prop];
      }
    });
    this.signin(user);
    this.submitted = true;
  }

  signin(user: User) {
    this.loading = true;
    this.authenticationService.login(user.email, user.password)
      .subscribe(
        (result) => {
          this.loading = false;
          if (result) {
            this.router.navigate(['/dashboard/home']);
          }
        },
        (error) => {
          this.error = 'L\'email et/ou le mot de passe ne sont pas valides';
          this.loading = false;
        },
      );
  }
}
