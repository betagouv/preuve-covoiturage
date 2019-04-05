import { Component , Injectable, OnInit } from '@angular/core';

import { AuthenticationService } from '~/applicativeService/authentication/service';


@Component({
  selector : 'app-menu',
  templateUrl : 'template.html',
  styleUrls : ['style.scss'],
})

@Injectable()
export class MenuComponent {
  constructor(
    private authenticationService: AuthenticationService,
  ) {
  }

  hasAnyGroup(groups: string[]) {
    const group = this.authenticationService.hasAnyGroup(groups);
    return !!group;
  }
}
