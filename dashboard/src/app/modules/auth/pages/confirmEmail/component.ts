import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { MessageService } from 'primeng/api';

import { AuthenticationService } from '~/applicativeService/authentication/service';


@Component({
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})

export class AuthPageConfirmEmailComponent implements OnInit {
  constructor(private activatedRoute: ActivatedRoute,
              private authenticationService: AuthenticationService,
              private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((params: Params) => {
      const token = params.get('token');
      const reset = params.get('reset');
      if (params && token && reset) {
        this.authenticationService.checkEmailToken(reset, token).subscribe(
            (response) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Votre adresse email est confirmée !',
              });
            },
            (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Une erreur est survenue lors de la confirmation de votre email, ' +
                                            'vérifier que vous avez bien ouvert le dernier email intitulé "Confirmation de votre email". ',
              });
            },
        );
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Une erreur est survenue lors de la confirmation de votre email, ' +
                                      'vérifier que vous avez bien ouvert le dernier email intitulé "Confirmation de votre email". ',
        });
      }
    });
  }
}
