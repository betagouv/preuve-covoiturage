import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { AuthenticationService } from '~/core/services/authentication/authentication.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthenticationService, private toastr: ToastrService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean> | Promise<boolean> | boolean {
    const isBaseUrl = state.url === '/trip/stats';
    const isSigninUrl = state.url === '/login';
    const isInGroups = !!this.authService.hasAnyGroup(route.data['groups'] || []);

    // check if the user is connected
    // todo: fill

    // check user's group against list given in the route (data.groups)
    if (!isInGroups && !isSigninUrl && !isBaseUrl) {
      this.router.navigate(['/login']).then(() => {
        this.toastr.success("Vous n'êtes pas authorisé à accéder à cette page.");
      });

      return false;
    }

    return true;
  }
}
