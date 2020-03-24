import { Component, OnInit } from '@angular/core';

import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { UserGroupEnum } from '~/core/enums/user/user-group.enum';
import { DestroyObservable } from '~/core/components/destroy-observable';

@Component({
  selector: 'app-trip-stats',
  templateUrl: './trip-stats.component.html',
  styleUrls: ['./trip-stats.component.scss'],
})
export class TripStatsComponent extends DestroyObservable implements OnInit {
  constructor(public authenticationService: AuthenticationService) {
    super();
  }

  ngOnInit(): void {}

  get isTerritoryOrRegistry(): boolean {
    return this.authenticationService.hasAnyGroup([UserGroupEnum.TERRITORY, UserGroupEnum.REGISTRY]);
  }

  get isOperator(): boolean {
    return this.authenticationService.hasAnyGroup([UserGroupEnum.OPERATOR]);
  }
}
