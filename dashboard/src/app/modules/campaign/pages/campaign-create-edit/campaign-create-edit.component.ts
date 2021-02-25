import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-campaign-create-edit',
  templateUrl: './campaign-create-edit.component.html',
  styleUrls: ['./campaign-create-edit.component.scss'],
})
export class CampaignCreateEditComponent implements OnInit {
  public campaignId: number = null;
  public parentId: number = null;
  public section = null;

  constructor(private _route: ActivatedRoute) {}

  ngOnInit(): void {
    const { campaignId, parentId, section } = {
      campaignId: null,
      parentId: null,
      section: null,
      ...this._route.snapshot.params,
      ...this._route.snapshot.queryParams,
    };

    this.campaignId = Number(campaignId);
    this.parentId = Number(parentId);
    this.section = section;
  }
}
