import { Component, OnInit } from '@angular/core';

import { AuthenticationService } from '~/applicativeService/authentication/service';


@Component({
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})


export class HomeComponent {
  constructor(
        private authenticationService: AuthenticationService,
    ) {
  }

  hasAnyGroup(groups: string[]) {
    return this.authenticationService.hasAnyGroup(groups);
  }
}
