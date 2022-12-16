import { format, subDays, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { BehaviorSubject, throwError } from 'rxjs';
import { PolicyInterface } from './../../../../../../../shared/policy/common/interfaces/PolicyInterface';

import { Component, Input, OnInit } from '@angular/core';

import { DestroyObservable } from '~/core/components/destroy-observable';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { ResultInterface as StatResultInterface } from '~/shared/policy/simulateOnPast.contract';

import { catchError } from 'rxjs/operators';
import { CampaignReducedStats } from '../../../../core/entities/campaign/api-format/CampaignStats';
import { CampaignApiService } from '../../services/campaign-api.service';

interface SimulationDateRange {
  startDate: Date;
  endDate: Date;
  startDateString: string;
  endDateString: string;
  nbMonth: number;
}

@Component({
  selector: 'app-campaign-simulation-pane',
  templateUrl: './campaign-simulation-pane.component.html',
  styleUrls: ['./campaign-simulation-pane.component.scss'],
})
export class CampaignSimulationPaneComponent extends DestroyObservable implements OnInit {
  @Input() campaign: PolicyInterface;

  public loading = true;
  public state: StatResultInterface = { trip_excluded: 0, trip_subsidized: 0, amount: 0 };
  public timeState = this.getTimeState(1);
  public range$ = new BehaviorSubject<number>(1);
  public simulatedCampaign$ = new BehaviorSubject<PolicyInterface>(null);
  public errors = {
    simulation_failed: false,
  };

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
    this.campaignApi.simulate({ policy: this.campaign}).pipe(
      catchError((err) => {
        this.errors.simulation_failed = true;
        this.loading = false;
        return throwError(err);
      })).subscribe((state: CampaignReducedStats) => {
        this.state = state
        this.loading = false;
      });
  }

  private getTimeState(nbMonth: number): SimulationDateRange {
    // 5 days ago
    const endDate = subDays(new Date(), 5);
    const startDate = subMonths(endDate, nbMonth);
  
    return {
      nbMonth,
      startDate,
      endDate,
      startDateString: format(startDate, 'd MMMM yyyy', { locale: fr }),
      endDateString: format(endDate, 'd MMMM yyyy', { locale: fr }),
    };
  }

}