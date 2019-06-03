import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Message } from 'primeng/api';

import { AuthenticationService } from '~/applicativeService/authentication/auth.service';
import { MAIN } from '~/config/main';

@Component({ templateUrl: 'template.html' })
export class AuthPageConfirmEmailComponent implements OnInit {
  public messages: Message[] = [];
  public hasError = false;
  public contactEmail: string = MAIN.contactEmail;

  constructor(private activatedRoute: ActivatedRoute, private authenticationService: AuthenticationService) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((params: Params) => {
      const token = params.get('token');
      const reset = params.get('reset');

      this.authenticationService.checkEmailToken(reset, token).subscribe(
        () => {
          this.hasError = false;
          this.messages = [
            {
              severity: 'success',
              summary: 'Email confirmé',
              detail: 'Vous pouvez changer votre mot de passe',
            },
          ];
        },
        (error) => {
          this.hasError = true;
          this.messages = [
            {
              severity: 'error',
              summary: 'Email non confirmé',
              detail: null,
            },
          ];
        },
      );
    });
  }
}
