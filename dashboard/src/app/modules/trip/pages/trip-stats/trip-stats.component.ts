import { Component, OnInit } from '@angular/core';

import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { UserGroupEnum } from '~/core/enums/user/user-group.enum';

@Component({
  selector: 'app-trip-stats',
  templateUrl: './trip-stats.component.html',
  styleUrls: ['./trip-stats.component.scss'],
})
export class TripStatsComponent implements OnInit {
  constructor(public authenticationService: AuthenticationService) {}

  ngOnInit() {}

  get isTerritoryOrRegistry(): boolean {
    return this.authenticationService.hasAnyGroup([UserGroupEnum.TERRITORY, UserGroupEnum.REGISTRY]);
  }

  get isOperator(): boolean {
    return this.authenticationService.hasAnyGroup([UserGroupEnum.OPERATOR]);
  }
}
