import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  Route,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { AuthenticationService } from '~/core/services/authentication/authentication.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(private router: Router, private authService: AuthenticationService, private toastr: ToastrService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // check if the user is connected
    // todo: fill
    const signedIn = true;

    if (!signedIn) {
      this.router.navigate(['/login']).then(() => {
        this.toastr.error("Vous n'êtes pas authorisé à accéder à cette page.");
      });
      return false;
    }

    return true;
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const isInGroups = 'groups' in route.data ? this.authService.hasAnyGroup(route.data['groups']) : true;
    const hasRole = 'role' in route.data ? this.authService.hasRole(route.data['role']) : true;

    if (!isInGroups || !hasRole) {
      this.router.navigate(['/']).then(() => {
        this.toastr.error("Vous n'êtes pas authorisé à accéder à cette page.");
      });
      return false;
    }
    return true;
  }

  canLoad(route: Route): boolean {
    // check if the user is connected
    // todo: fill
    const signedIn = true;

    if (!signedIn) {
      this.router.navigate(['/login']).then(() => {
        this.toastr.error("Vous n'êtes pas authorisé à accéder à cette page.");
      });
      return false;
    }
    return true;
  }
}
