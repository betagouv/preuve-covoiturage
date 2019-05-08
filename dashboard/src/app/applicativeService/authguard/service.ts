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
    const isBaseUrl = state.url === '/dashboard/home';
    const isSigninUrl = state.url === '/signin';
    const isInGroups = !!this.authService.hasAnyGroup(route.data['groups'] || []);

    // check if the user is connected
    if (!user && !isSigninUrl) {
      const options = isBaseUrl ? undefined : { queryParams: { flash: 'unauthorized' } };

      return this.router.navigate(['/signin'], options);
    }

    // check user's group against list given in the route (data.groups)
    if (!isInGroups && !isSigninUrl && !isBaseUrl) {
      const options = isBaseUrl ? undefined : { queryParams: { flash: 'unauthorized' } };

      return this.router.navigate(['/signin'], options);
    }

    return true;
  }
}
