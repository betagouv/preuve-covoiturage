import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

import { InputGroup } from '~/entities/form/inputGroup';
import { AuthenticationService } from '~/applicativeService/authentication/service';
import { User } from '~/entities/database/user';
import { EmailInputBase } from '~/entities/form/emailInputBase';

@Component({
  selector: 'app-auth-form-forgotten-password',
  templateUrl: 'template.html',
})

export class AuthFormForgottenPasswordComponent implements OnInit {
  public inputGroups: InputGroup<any>[] = [];
  public success: string;
  public form;
  public loading = false;

  constructor(
      private router: Router,
      private authenticationService: AuthenticationService,
      private messageService: MessageService,
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


    ];

    this.inputGroups = [

      new InputGroup({
        key : 'main',
        inputs: mainInputs,
      }),


    ];
  }

  sendEmailForNewPassword(user:User) {
    this.loading = true;
    this.authenticationService.sendEmailForPasswordReset(user.email)
          .subscribe(
              (response) => {
                this.loading = false;
                this.messageService.add({
                  severity: 'success',
                  summary: `Un email vous a été envoyé pour réinitialiser votre mot de passe !`,
                });
                setTimeout(() => {
                  this.router.navigate(['/signin']);
                },
                           4000); // tslint:disable-line:no-magic-numbers
              },
              (error) => {
                this.loading = false;
                // fix: do nothhing ?;
              },
          );
  }
}
