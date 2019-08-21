import { Component, OnInit } from '@angular/core';

import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { CampaignStatus } from '~/core/entities/campaign/campaign-status';

import { tripStats } from '../../config/tripStats';

@Component({
  selector: 'app-trip-stats',
  templateUrl: './trip-stats.component.html',
  styleUrls: ['./trip-stats.component.scss'],
})
export class TripStatsComponent implements OnInit {
  public tripStats = tripStats;
  public campaignStatusEnum = CampaignStatus;

  constructor(public authenticationService: AuthenticationService) {}

  ngOnInit() {}
}
