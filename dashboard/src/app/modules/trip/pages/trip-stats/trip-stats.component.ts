import { Component, OnInit } from '@angular/core';

import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { CampaignStatusEnum } from '~/core/enums/campaign/campaign-status.enum';

import { tripStats } from '../../config/tripStats';

@Component({
  selector: 'app-trip-stats',
  templateUrl: './trip-stats.component.html',
  styleUrls: ['./trip-stats.component.scss'],
})
export class TripStatsComponent implements OnInit {
  public tripStats = tripStats;
  public campaignStatusEnum = CampaignStatusEnum;

  constructor(public authenticationService: AuthenticationService) {}

  ngOnInit() {}
}
