import { Component, OnInit } from '@angular/core';
import { CampaignApiService } from '../../services/campaign-api.service';

@Component({
  selector: 'app-campaign-capitalcall',
  templateUrl: './campaign-capitalcall.component.html',
  styleUrls: ['./campaign-capitalcall.component.scss'],
})
export class CampaignCapitalcallComponent implements OnInit {
  constructor(private campaignApiService: CampaignApiService) {}

  ngOnInit(): void {}
}
