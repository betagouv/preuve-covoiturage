import * as moment from 'moment';
import { format, subDays, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { omit } from 'lodash-es';
import { BehaviorSubject, combineLatest, throwError } from 'rxjs';
import { catchError, debounceTime, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';

import { CurrencyPipe } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChange } from '@angular/core';

import { CampaignUx } from '~/core/entities/campaign/ux-format/campaign-ux';
import { CampaignFormater } from '~/core/entities/campaign/api-format/campaign.formater';
import { IncentiveUnitEnum } from '~/core/enums/campaign/incentive-unit.enum';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { CampaignReducedStats } from '~/core/entities/campaign/api-format/CampaignStats';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';

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
export class CampaignSimulationPaneComponent extends DestroyObservable implements OnInit, OnChanges {
  @Input() campaign: CampaignUx;

  public loading = true;
  public state: CampaignReducedStats = { trip_excluded: 0, trip_subsidized: 0, amount: 0 };
  public timeState = getTimeState(1);
  public range$ = new BehaviorSubject<number>(1);
  public simulatedCampaign$ = new BehaviorSubject<CampaignUx>(null);
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
    combineLatest([this.range$, this.simulatedCampaign$])
      .pipe(
        debounceTime(250),
        tap(() => {
          this.loading = true;
          Object.keys(this.errors).forEach((key) => (this.errors[key] = false));
        }),
        filter(([, campaign]) => this.auth.user && (!!campaign.territory_id || !!this.auth.user.territory_id)),
        map(([r, c]: [number, CampaignUx]) => {
          this.timeState = getTimeState(r);
          c.start = moment(this.timeState.startDate);
          c.end = moment(this.timeState.endDate);
          c.territory_id = c.territory_id || this.auth.user.territory_id;
          delete c._id;
          return c;
        }),
        map(CampaignFormater.toApi),
        switchMap((c) =>
          this.campaignApi.simulate(c).pipe(
            catchError((err) => {
              this.errors.simulation_failed = true;
              this.loading = false;
              return throwError(err);
            }),
          ),
        ),
        takeUntil(this.destroy$),
      )
      .subscribe((state: CampaignReducedStats) => {
        this.state = {
          ...state,
          amount:
            this.simulatedCampaign$.value.unit === IncentiveUnitEnum.EUR
              ? (new CurrencyPipe('FR').transform(state.amount / 100, 'EUR', 'symbol', '1.2-2') as any)
              : (`${state.amount} pt${state.amount > 1 ? 's' : ''}` as any),
        };

        this.loading = false;
      });
  }

  ngOnChanges({ campaign }: { campaign: SimpleChange }): void {
    const { previousValue, currentValue } = campaign;

    // keys not triggering a refresh
    const bypassKeys = ['name', 'description'];
    const hasChanged = !deepEqual(omit(previousValue, bypassKeys), omit(currentValue, bypassKeys));
    if (hasChanged) this.simulatedCampaign$.next(new CampaignUx(currentValue));
  }
}

/**
 * ------------------------------------------------------------------------------------------------
 *  Helper functions
 * ------------------------------------------------------------------------------------------------
 */

function getTimeState(nbMonth: number): SimulationDateRange {
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

function deepEqual(obj1: any, obj2: any): boolean {
  if (typeof obj1 === 'undefined' && typeof obj2 === 'undefined') return true;
  if (typeof obj1 === 'undefined' || typeof obj2 === 'undefined') return false;
  if (obj1 === obj2) return true;
  if (isPrimitive(obj1) && isPrimitive(obj2)) return obj1 === obj2;
  if (Object.keys(obj1).length !== Object.keys(obj2).length) return false;

  // compare objects with same number of keys
  for (const key in obj1) {
    if (!(key in obj2)) return false; //other object doesn't have this prop
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }

  return true;
}

//check if value is primitive
function isPrimitive(obj) {
  return obj !== Object(obj);
}
