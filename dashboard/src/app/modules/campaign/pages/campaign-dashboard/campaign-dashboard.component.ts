import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-campaign-dashboard',
  templateUrl: './campaign-dashboard.component.html',
  styleUrls: ['./campaign-dashboard.component.scss'],
})
export class CampaignDashboardComponent implements OnInit {
  activeCampaigns: any[];

  constructor() {
  }

  ngOnInit() {
    this.loadCampaigns();
  }

  private loadCampaigns(): void {
    this.activeCampaigns = [{}, {}, {}];
  }
}
