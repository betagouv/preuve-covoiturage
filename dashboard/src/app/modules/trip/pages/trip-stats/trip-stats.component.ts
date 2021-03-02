import { Component, OnInit } from '@angular/core';

import { AuthenticationService } from '~/core/services/authentication/authentication.service';

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

  get isOperator(): boolean {
    return this.auth.isOperator();
  }
}
