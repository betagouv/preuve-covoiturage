import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { AuthenticationService } from '~/core/services/authentication/authentication.service';

@Injectable({
  providedIn: 'root',
})
export class LoginGuardService implements CanActivate {
  constructor(private router: Router, private authService: AuthenticationService, private toastr: ToastrService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    // check if the user is connected

    return this.authService.check().pipe(
      tap((user) => {
        if (user) {
          if (user.territory_id) {
            this.router.navigate(['/campaign']);
          } else {
            this.router.navigate(['/trip/stats']);
          }
        }
        // this.router.navigate(['/trip/stats']);
        // this.toastr.error('Votre lien d\'invitation n\'est pas valide');
      }),
      map((user) => !user),
    );
  }
}
