import { Component, Output } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Message } from 'primeng/api';

import { AuthenticationService } from '~/applicativeService/authentication/auth.service';

@Component({
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})
export class AuthPageNewPasswordComponent {
  @Output() public token: string;
  @Output() public reset: string;
  public messages: Message[] = [];
  public hasError = false;

  constructor(private authenticationService: AuthenticationService, private activatedRoute: ActivatedRoute) {}

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
            this.hasError = false;
            this.token = token;
            this.reset = reset;
          },
          () => {
            this.hasError = true;
            this.messages = [
              {
                severity: 'error',
                summary:
                  'Une erreur est survenue lors de la réinitalisation de votre mot de passe, ' +
                  'vérifier que vous avez bien ouvert le dernier email intitulé "Nouveau mot de passe ". ',
              },
            ];
          },
        );
      } else {
        this.messages = [
          {
            severity: 'error',
            summary:
              'Une erreur est survenue lors de la réinitalisation de votre mot de passe, ' +
              'vérifier que vous avez bien ouvert le dernier email intitulé "Nouveau mot de passe ". ',
          },
        ];
      }
    });
  }
}
