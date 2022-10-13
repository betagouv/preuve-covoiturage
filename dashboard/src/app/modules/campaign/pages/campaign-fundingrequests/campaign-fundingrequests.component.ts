import { Component, Input, OnInit } from '@angular/core';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonDataService } from '~/core/services/common-data.service';
import { ResultsInterface as FundingRequestsListResult } from '~/shared/policy/fundingRequestsList.contract';
import { FundingRequestsApiService } from '../../services/fundingrequests-api.service';
import { PolicyInterface } from './../../../../../../../shared/policy/common/interfaces/PolicyInterface';

@Component({
  selector: 'app-campaign-fundingrequests',
  templateUrl: './campaign-fundingrequests.component.html',
  styleUrls: ['./campaign-fundingrequests.component.scss'],
})
export class CampaignFundingRequestsComponent implements OnInit {
  @Input() campaign: PolicyInterface;

  public fRequestsList: FundingRequestsListResult;
  public displayedColumns: string[] = ['month', 'operator', 'action'];

  constructor(private fRequestsApiService: FundingRequestsApiService, private commonData: CommonDataService) {}

  ngOnInit(): void {
    // fetch funding requests for a given campaign
    // add some display data as operator name and sort the results
    combineLatest([this.commonData.operators$, this.fRequestsApiService.list(this.campaign._id)])
      .pipe(
        map(([operators, freq]: [any, any]) =>
          freq
            .map((fr) => {
              const op = operators.find((o) => o._id === fr.operator_id);
              const operator = op?.name;
              const month = fr.datetime.substring(0, 7);
              return { ...fr, month, operator, skey: `${month}-${operator}` };
            })
            .sort(({ skey: a }, { skey: b }) => (a > b ? -1 : a < b ? 1 : 0)),
        ),
      )
      .subscribe((frequests: FundingRequestsListResult) => {
        this.fRequestsList = frequests;
      });
  }
}
