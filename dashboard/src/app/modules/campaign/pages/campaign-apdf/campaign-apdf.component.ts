import { Component, Input, OnInit } from '@angular/core';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthenticationService as Auth } from '~/core/services/authentication/authentication.service';
import { CommonDataService } from '~/core/services/common-data.service';
import { EnrichedApdfType, ResultsInterface as ApdfListResult } from '~/shared/apdf/list.contract';
import { PolicyInterface } from '~/shared/policy/common/interfaces/PolicyInterface';
import { ApdfApiService } from '../../services/apdf-api.service';

@Component({
  selector: 'app-campaign-apdf',
  templateUrl: './campaign-apdf.component.html',
  styleUrls: ['./campaign-apdf.component.scss'],
})
export class CampaignApdfComponent implements OnInit {
  @Input() campaign: PolicyInterface;

  public list: ApdfListResult;
  public displayedColumns: string[] = [];

  constructor(
    private apdfApiService: ApdfApiService,
    private commonData: CommonDataService,
    private auth: Auth,
  ) {}

  ngOnInit(): void {
    this.displayedColumns = this.auth.isSuperAdmin()
      ? ['month', 'operator', 'trips', 'subsidized', 'amount', 'filesize', 'action']
      : ['month', 'operator', 'subsidized', 'amount', 'action'];

    // fetch APDF for a given campaign
    // add some display data as operator name and sort the results
    combineLatest([this.commonData.operators$, this.apdfApiService.list(this.campaign._id)])
      .pipe(
        map(([operators, freq]: [any, any]) =>
          freq
            .map((fr: EnrichedApdfType) => {
              const op = (operators || []).find((o: { _id: number }) => o._id === fr.operator_id);
              const operator = op?.name;
              // the datetime is a string here as it hasn't been cast to Date
              const month = (fr.datetime as unknown as string).substring(0, 7);
              return { ...fr, month, operator, skey: `${month}-${operator}` };
            })
            .sort(({ skey: a }, { skey: b }) => (a > b ? -1 : a < b ? 1 : 0)),
        ),
      )
      .subscribe((list: ApdfListResult) => {
        this.list = list;
      });
  }
}
