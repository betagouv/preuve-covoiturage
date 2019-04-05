import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { InputGroup } from '~/entities/form/inputGroup';
import { AuthenticationService } from '~/applicativeService/authentication/service';
import { PasswordInputBase } from '~/entities/form/passwordInputBase';

@Component({
  selector: 'app-auth-form-new-password',
  templateUrl: 'template.html',
})

export class AuthFormNewPasswordComponent implements OnInit {
  public inputGroups: InputGroup<any>[] = [];
  private token: string;
  private reset: string;
  public loading = false;

  public form;

  constructor(
      private router: Router,
      private authenticationService: AuthenticationService,
      private activatedRoute: ActivatedRoute,
      private messageService: MessageService,

  ) {

  }

  ngOnInit(): void {
    this.authenticationService.logout();
    this.getToken();
    const mainInputs = [
      new PasswordInputBase({
        key: 'password',
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

  getToken() {
    this.activatedRoute.paramMap.subscribe((params: Params) => {
      const token = params.get('token');
      const reset = params.get('reset');
      if (params && token && reset) {
        this.authenticationService.checkPasswordToken(reset, token).subscribe(
            (response) => {
              this.token = token;
              this.reset = reset;
            },
            (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Une erreur est survenue lors de la réinitalisation de votre mot de passe, ' +
                'vérifier que vous avez bien ouvert le dernier email intitulé "Nouveau mot de passe ". ',
              });
            },
        );
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Une erreur est survenue lors de la réinitalisation de votre mot de passe, ' +
          'vérifier que vous avez bien ouvert le dernier email intitulé "Nouveau mot de passe ". ',
        });
      }
    });
  }

  setNewPassword(password:string) {
    if (this.token) {
      this.loading = true;
      this.authenticationService.postNewPassword(this.reset, this.token, password)
          .subscribe(
              (response) => {
                this.loading = false;
                this.messageService.add({
                  severity: 'success',
                  summary: 'Votre mot de passe a été modifié avec succès !',
                });
                setTimeout(() => {
                  this.router.navigate(['/dashboard']);
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
}
