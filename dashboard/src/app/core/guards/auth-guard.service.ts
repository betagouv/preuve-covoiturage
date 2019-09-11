import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  CanLoad,
  Route,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {
  constructor(private router: Router, private authService: AuthenticationService, private toastr: ToastrService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    // check if the user is connected

    return this.authService.check().pipe(
      map((user) => !!user),
      tap((loggedIn) => {
        if (!loggedIn) {
          this.router.navigate(['/login']).then(() => {
            this.toastr.error("Vous n'êtes pas authorisé à accéder à cette page.");
          });
        } else if (state.url === '/') {
          this.router.navigate(['/trip/stats']);
        }
      }),
    );
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.authService.check().pipe(
      map((user) => {
        if (!user) {
          this.router.navigate(['/login']).then(() => {
            this.toastr.error("Vous n'êtes pas authorisé à accéder à cette page.");
          });
          return false;
        }

        const isInGroups = 'groups' in route.data ? this.authService.hasAnyGroup(route.data['groups']) : true;
        const hasRole = 'role' in route.data ? this.authService.hasRole(route.data['role']) : true;

        if (!isInGroups || !hasRole) {
          this.router.navigate(['/']).then(() => {
            this.toastr.error("Vous n'êtes pas authorisé à accéder à cette page.");
          });
          return false;
        }

        return true;
      }),
    );

    // if (!isInGroups || !hasRole) {
    //   this.router.navigate(['/']).then(() => {
    //     this.toastr.error('Vous n\'êtes pas authorisé à accéder à cette page.');
    //   });
    //   return false;
    // }
    // return true;
  }

  canLoad(route: Route): Observable<boolean> {
    return this.authService.check().pipe(
      map((user) => !!user),
      tap((loggedIn) => {
        if (!loggedIn) {
          this.router.navigate(['/login']).then(() => {
            this.toastr.error("Vous n'êtes pas authorisé à accéder à cette page.");
          });
        }
      }),
    );
  }
}
