import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Message } from 'primeng/api';

import { AuthenticationService } from '~/applicativeService/authentication/service';

@Component({ templateUrl: 'template.html' })

export class AuthPageConfirmEmailComponent implements OnInit {
  public messages: Message[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private authenticationService: AuthenticationService,
  ) {
  }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((params: Params) => {
      const token = params.get('token');
      const reset = params.get('reset');

      this.authenticationService
        .checkEmailToken(reset, token)
        .subscribe(
          () => {
            this.messages = [{
              severity: 'success',
              summary: 'Email confirmé',
              detail: `Vous pouvez maintenant vous connecter.
                       <br><br>
                       <a href="/signin">Se connecter</a>`,
            }];
          },
          (error) => {
            this.messages = [{
              severity: 'error',
              summary: error.statusText,
              detail: error.message,
            }];
          },
        );
    });
  }
}
