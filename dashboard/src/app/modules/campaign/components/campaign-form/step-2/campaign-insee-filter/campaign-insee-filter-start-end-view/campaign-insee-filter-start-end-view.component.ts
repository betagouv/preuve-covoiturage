import { Component, Input, OnInit } from '@angular/core';

import { InseeAndTerritoryInterface } from '~/core/entities/campaign/ux-format/incentive-filters';

@Component({
  selector: 'app-campaign-insee-filter-start-end-view',
  templateUrl: './campaign-insee-filter-start-end-view.component.html',
  styleUrls: ['./campaign-insee-filter-start-end-view.component.scss'],
})
export class CampaignInseeFilterStartEndViewComponent implements OnInit {
  @Input() startTerritories: InseeAndTerritoryInterface[];
  @Input() endTerritories: InseeAndTerritoryInterface[];
  @Input() filterType: 'blackList' | 'whiteList';

  constructor() {}

  ngOnInit() {}
}
