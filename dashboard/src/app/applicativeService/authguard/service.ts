import { Injectable } from '@angular/core';
import { Router, CanActivate , ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

import { MessageService } from 'primeng/api';

import { AuthenticationService } from '../authentication/service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
        private router: Router,
        private authentificationService: AuthenticationService,
        private messageService: MessageService,
    ) { }

  canActivate (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean>|Promise<boolean>|boolean {
    const isLoggedIn = (null !== (localStorage.getItem('user')));

    if (!isLoggedIn) {
        // Si pas d'utilisateur connecté : redirection vers la page de login
      if (state.url !== '/') {
        this.messageService.add({
          severity: 'error',
          summary: 'Vous n\'êtes pas connecté !',
        });
      }
      this.router.navigate(['/signin']);
    }

    const groups = route.data['groups'];
    let hasGroup = true;
    if (groups) {
      hasGroup = this.authentificationService.hasAnyGroup(groups) !== null;
    }
    if (!hasGroup) {
        // Si l'utilisateur n'a pas les droits : redirection vers la page de login
      if (state.url !== '/') {
        this.messageService.add({
          severity: 'error',
          summary: 'Vous n\'avez pas les droits',
        });
      }
      this.router.navigate(['/signin']);
    }

    return isLoggedIn && hasGroup;

      // pas besoin d'envoyer le ping à chaque route, le faire avec un setInterval
      // return this.pingService.ping(state.url); <-- todo: rajouter le ping plus tard
  }
}
