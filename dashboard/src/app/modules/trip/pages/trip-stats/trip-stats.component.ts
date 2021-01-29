import { Component, OnInit } from '@angular/core';

import { AuthenticationService } from '~/core/services/authentication/authentication.service';

import { OPERATOR_STATS, PUBLIC_STATS } from '~/modules/stat/config/stat';
import { StatNavName } from '~/core/types/stat/statDataNameType';

@Component({
  selector: 'app-trip-stats',
  templateUrl: './trip-stats.component.html',
  styleUrls: ['./trip-stats.component.scss'],
})
export class TripStatsComponent implements OnInit {
  constructor(public auth: AuthenticationService) {}

  ngOnInit(): void {}

  get isTerritoryOrRegistry(): boolean {
    return this.auth.isTerritory() || this.auth.isRegistry();
  }

  get statsList(): StatNavName[] {
    return this.isTerritoryOrRegistry ? PUBLIC_STATS : OPERATOR_STATS;
  }

  get isOperator(): boolean {
    return this.auth.isOperator();
  }
}
