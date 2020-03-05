import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { merge } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DestroyObservable } from '~/core/components/destroy-observable';

@Component({
  selector: 'app-campaign-create-edit',
  templateUrl: './campaign-create-edit.component.html',
  styleUrls: ['./campaign-create-edit.component.scss'],
})
export class CampaignCreateEditComponent extends DestroyObservable implements OnInit {
  public campaignId: number = null;
  public parentId: number = null;
  public loading = true;
  public section = null;

  constructor(private _route: ActivatedRoute) {
    super();
  }

  ngOnInit(): void {
    merge(this._route.paramMap, this._route.queryParamMap)
      .pipe(takeUntil(this.destroy$))
      .subscribe((params: ParamMap) => {
        if (params.has('campaignId')) {
          this.campaignId = Number(params.get('campaignId'));
        }
        if (params.has('parentId')) {
          this.parentId = Number(params.get('parentId'));
        }
        if (params.has('section')) {
          this.section = params.get('section');
        }
        this.loading = false;
      });
  }
}
