import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { CampaignStatusEnum } from '~/core/enums/campaign/campaign-status.enum';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';

@Component({
  selector: 'app-campaign-dashboard',
  templateUrl: './campaign-dashboard.component.html',
  styleUrls: ['./campaign-dashboard.component.scss'],
})
export class CampaignDashboardComponent implements OnInit {
  campaignStatus = CampaignStatusEnum;
  canCreateCampaign$: Observable<boolean>;

  constructor(private authentificationService: AuthenticationService) {}

  ngOnInit() {
    this.canCreateCampaign$ = this.authentificationService.user$.pipe(
      map((user) => user && this.authentificationService.hasAnyPermission(['incentive-campaign.create'])),
    );
  }
}
