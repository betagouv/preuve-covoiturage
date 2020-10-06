import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { AuthenticationService } from '~/core/services/authentication/authentication.service';

@Injectable({
  providedIn: 'root',
})
export class LoginGuardService implements CanActivate {
  constructor(private router: Router, private authService: AuthenticationService) {}

  canActivate(): Observable<boolean> {
    return this.authService.check().pipe(
      tap((user) => {
        if (user) {
          if (user.territory_id) {
            this.router.navigate(['/campaign']);
          } else {
            this.router.navigate(['/trip/stats']);
          }
        }
      }),
      map((user) => !user),
    );
  }
}
