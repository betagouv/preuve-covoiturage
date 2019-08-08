import { Component, Input, OnInit } from '@angular/core';

import { Campaign } from '~/core/entities/campaign/campaign';

@Component({
  selector: 'app-campaigns-list',
  templateUrl: './campaigns-list.component.html',
  styleUrls: ['./campaigns-list.component.scss'],
})
export class CampaignsListComponent implements OnInit {
  @Input() campaigns: Campaign[];

  constructor() {}

  ngOnInit() {}
}
