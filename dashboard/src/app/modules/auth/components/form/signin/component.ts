import { Component, OnInit } from '@angular/core';
import { Router, UrlSerializer } from '@angular/router';

import { AuthenticationService } from '~/applicativeService/authentication/service';
import { PasswordInputBase } from '~/entities/form/passwordInputBase';
import { InputGroup } from '~/entities/form/inputGroup';
import { EmailInputBase } from '~/entities/form/emailInputBase';
import { User } from '~/entities/database/user';


@Component({
  selector: 'app-auth-form-signin',
  templateUrl: 'template.html',
})

export class AuthFormSigninComponent implements OnInit {
  public inputGroups: InputGroup<any>[] = [];

  model: any = {};
  loading = false;
  error = '';


  constructor(
      private router: Router,
      private authenticationService: AuthenticationService,
  ) {
  }

  ngOnInit(): void {
    this.authenticationService.logout();
    const mainInputs = [
      new EmailInputBase({
        key: 'email',
        placeholder: 'Email',
        value: null,
        required: true,
      }),


      new PasswordInputBase({
        key: 'password',
        placeholder: 'Mot de passe',
        value: null,
        required: true,
      }),


    ];

    this.inputGroups = [

      new InputGroup({
        key: 'main',
        inputs: mainInputs,
      }),


    ];
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
