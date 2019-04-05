import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';

import { MAIN } from '~/config/main';

@Component({
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})

export class AuthPageSigninComponent {
  contactEmail = MAIN.contactEmail;
  public params: any;

  constructor(
    private route: ActivatedRoute,
    private messageService: MessageService,
  ) {
    this.params = route.snapshot.queryParams;
  }

  ngOnInit() {
    if (this.params && this.params.flash) {
      // display a flash message
      switch (this.params.flash) {
        case 'password-sent':
          this.messageService.add({
            severity: 'success',
            summary: 'Un lien de changement de mot de passe vous a été envoyé',
          });
          break;

        case 'password-changed':
          this.messageService.add({
            severity: 'success',
            summary: 'Mot de passe modifié avec succès',
          });
          break;

        case 'unauthorized':
          this.messageService.add({
            severity: 'error',
            summary: 'Merci de vous connecter',
          });
          break;

        case 'forbidden':
          this.messageService.add({
            severity: 'error',
            summary: 'Vous n\'avez pas l\'autorisation',
          });
          break;
      }
    }
  }
}
