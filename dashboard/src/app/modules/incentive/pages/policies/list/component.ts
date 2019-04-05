import { Component, OnInit } from '@angular/core';

import { animate, state, style, transition, trigger } from '@angular/animations';

import { IncentivePolicy } from '~/entities/database/Incentive/incentivePolicy';
import { ApiResponse } from '~/entities/responses/apiResponse';
import { Meta } from '~/entities/responses/meta';
import { TableService } from '~/services/tableService';
import { TranslationService } from '~/services/translationService';

import { INCENTIVE_HEADERS } from '../../../config/header';
import { IncentivePolicyService } from '../../../services/incentivePolicyService';

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


export class IncentivePoliciesListPageComponent implements OnInit {
  policies: IncentivePolicy[];
  public headList: string[] = INCENTIVE_HEADERS.policies.main;
  public loading = true;
  total = 30;
  perPage = 10;
  columns = [];


  constructor(
      private incentivePolicyService: IncentivePolicyService,
      private translationService: TranslationService,
      private ts: TableService,

  ) {
    this.setColumns();
  }

  ngOnInit() {
    this.get();
  }

  public get() {
    this.incentivePolicyService.get().subscribe((response: ApiResponse) => {
      this.setTotal(response.meta ? response.meta : null);
      this.policies = response.data;
      this.loading = false;
    });
  }

  getValue(aom: object, key: string): string {
    return this.translationService.getTableValue(aom, key);
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
