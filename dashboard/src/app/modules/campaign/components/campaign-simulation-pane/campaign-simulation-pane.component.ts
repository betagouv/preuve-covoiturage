import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject, throwError } from 'rxjs';
import { catchError, debounceTime, map, tap } from 'rxjs/operators';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { CompiledPolicyInterface } from '~/shared/policy/common/interfaces/PolicyInterface';
import { ResultInterface as SimulateOnPastResult } from '~/shared/policy/simulateOnPast.contract';
import { CampaignApiService } from '../../services/campaign-api.service';

@Component({
  selector: 'app-campaign-simulation-pane',
  templateUrl: './campaign-simulation-pane.component.html',
  styleUrls: ['./campaign-simulation-pane.component.scss'],
})
export class CampaignSimulationPaneComponent extends DestroyObservable implements OnInit {
  @Input() campaign: CompiledPolicyInterface;

  public loading = true;
  public state: SimulateOnPastResult;
  public range$ = new BehaviorSubject<number>(1);
  public simulatedCampaign$ = new BehaviorSubject<CompiledPolicyInterface>(null);
  public errors_simulation_failed = false;

  get months(): number {
    return this.range$.value;
  }

  set months(value: number) {
    this.range$.next(value);
  }

  constructor(protected campaignApi: CampaignApiService, protected auth: AuthenticationService) {
    super();
  }

  ngOnInit(): void {
    this.range$
      .pipe(
        debounceTime(250),
        tap(() => {
          this.loading = true;
          this.errors_simulation_failed = false;
        }),
        map((range: number) => {
          return {
            territory_id: this.campaign.territory_id,
            name: this.campaign.name,
            handler: this.campaign.handler,
            months: range,
          };
        }),
      )
      .subscribe((simulateOnPastParam) => {
        this.campaignApi
          .simulate(simulateOnPastParam)
          .pipe(
            catchError((err) => {
              this.errors_simulation_failed = true;
              this.loading = false;
              return throwError(err);
            }),
          )
          .subscribe((state: SimulateOnPastResult) => {
            this.state = state;
            this.loading = false;
          });
      });
  }
}
