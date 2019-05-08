import { Component, OnInit } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';

import { ApiResponse } from '~/entities/responses/apiResponse';
import { Meta } from '~/entities/responses/meta';
import { TableService } from '~/shared/services/tableService';
import { TranslationService } from '~/shared/services/translationService';
import { IncentiveCampaign } from '~/entities/database/Incentive/incentiveCampaign';

import { INCENTIVE_HEADERS } from '../../../config/header';
import { IncentiveCampaignService } from '../../../services/incentiveCampaignService';

@Component({
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
  animations: [
    trigger('rowExpansionTrigger', [
      state('void', style({
        transform: 'translateX(-10%)',
        opacity: 0,
      })),
      state('active', style({
        transform: 'translateX(0)',
        opacity: 1,
      })),
      transition('* <=> *', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)')),
    ]),
  ],
})


export class IncentiveCampaignsListPageComponent implements OnInit {
  campaigns: IncentiveCampaign[];
  public headList: string[] = INCENTIVE_HEADERS.campaigns.main;
  public loading = true;
  total = 30;
  perPage = 10;
  columns = [];


  constructor(
      private incentiveCampaignService: IncentiveCampaignService,
      private translationService: TranslationService,
      private ts: TableService,

  ) {
    this.setColumns();
  }

  ngOnInit() {
    this.get();
  }

  public get() {
    this.incentiveCampaignService.get().subscribe((response: ApiResponse) => {
      this.setTotal(response.meta ? response.meta : null);
      this.campaigns = response.data;
      this.loading = false;
    });
  }

  getValue(aom: object, key: string): string {
    return this.translationService.getTableValue(aom, key);
  }

  isNaN(value) {
    return isNaN(value);
  }


  private setColumns() {
    for (const head of this.headList) {
      this.columns.push(this.ts.createColumn(head));
    }
  }

  private setTotal(meta: Meta) {
    if (meta && meta.hasOwnProperty('pagination')) {
      this.total = meta['pagination']['total'];
      this.perPage = meta['pagination']['per_page'];
    }
  }
}
