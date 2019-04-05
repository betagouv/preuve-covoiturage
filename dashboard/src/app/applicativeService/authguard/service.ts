import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthenticationService } from '../authentication/service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthenticationService,
  ) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const user = this.authService.check();
    const isSigninUrl = state.url === '/signin';
    const isInGroups = !!this.authService.hasAnyGroup(route.data['groups'] || []);

    // check if the user is connected
    if (!user && !isSigninUrl) {
      return this.router.navigate(['/signin'], { queryParams: { flash: 'unauthorized' } });
    }

    // check user's group against list given in the route (data.groups)
    if (!isInGroups && !isSigninUrl) {
      return this.router.navigate(['/signin'], { queryParams: { flash: 'forbidden' } });
    }

    return true;
  }
}
