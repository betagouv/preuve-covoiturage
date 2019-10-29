import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { from, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { AuthenticationService } from '~/core/services/authentication/authentication.service';

@Injectable({
  providedIn: 'root',
})
export class ChangeEmailGuardService implements CanActivate {
  constructor(private router: Router, private authService: AuthenticationService, private toastr: ToastrService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    // check if the user is connected

    return this.authService.confirmEmail(route.params.email, route.params.token).pipe(
      catchError((err) => of(false)),
      map((result) => !!result),
    );
  }
}
