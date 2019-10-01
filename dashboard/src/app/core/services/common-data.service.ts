// tslint:disable:prefer-conditional-expression

import { Injectable } from '@angular/core';
import { OperatorService } from '~/modules/operator/services/operator.service';
import { TerritoryService } from '~/modules/territory/services/territory.service';
import { BehaviorSubject, forkJoin, Observable, of } from 'rxjs';
import { Operator } from '~/core/entities/operator/operator';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { mergeMap, tap } from 'rxjs/operators';
import { User } from '~/core/entities/authentication/user';
import { Territory } from '~/core/entities/territory/territory';
import { Campaign } from '~/core/entities/campaign/campaign';
import { CampaignService } from '~/modules/campaign/services/campaign.service';

@Injectable({
  providedIn: 'root',
})
export class CommonDataService {
  private _currentOperator$ = new BehaviorSubject<Operator>(null);
  private _currentTerritory$ = new BehaviorSubject<Territory>(null);

  private _territories$ = new BehaviorSubject<Territory[]>(null);
  private _operators$ = new BehaviorSubject<Operator[]>(null);
  private _campaigns$ = new BehaviorSubject<Campaign[]>(null);

  get currentOperator$(): Observable<Operator> {
    return this._currentOperator$;
  }

  get currentTerritory$(): Observable<Territory> {
    return this._currentTerritory$;
  }

  get territories$(): Observable<Territory[]> {
    return this._territories$;
  }

  get operators$(): Observable<Operator[]> {
    return this._operators$;
  }

  get campaigns$(): Observable<Campaign[]> {
    return this._campaigns$;
  }

  get currentOperator(): Operator {
    return this._currentOperator$.value;
  }

  get currentTerritory(): Territory {
    return this._currentTerritory$.value;
  }

  get territories(): Territory[] {
    return this._territories$.value;
  }

  get operators(): Operator[] {
    return this._operators$.value;
  }

  get campaigns(): Campaign[] {
    return this._campaigns$.value;
  }

  constructor(
    private operatorService: OperatorService,
    private territoryService: TerritoryService,
    private campaignService: CampaignService,
    private authenticationService: AuthenticationService,
  ) {
    this.authenticationService.user$.subscribe(() => this.loadAll());
  }

  loadCurrentOperator(): Observable<Operator> {
    return this.authenticationService.check().pipe(
      mergeMap((user: User) => {
        if (!user || !user.operator) return of<Operator>(null);
        return this.operatorService.get(user.operator);
      }),
      tap((operator) => this._currentOperator$.next(operator)),
    );
  }

  loadCurrentTerritory(): Observable<Territory> {
    return this.authenticationService.check().pipe(
      mergeMap((user: User) => {
        if (!user || !user.territory) return of<Territory>(null);
        return this.territoryService.get(user.territory);
      }),
      tap((territory) => this._currentTerritory$.next(territory)),
    );
  }

  loadOperators(): Observable<Operator[]> {
    return this.operatorService.load().pipe(tap((operators) => this._operators$.next(operators)));
  }

  loadTerritories(): Observable<Territory[]> {
    return this.territoryService.load().pipe(tap((territories) => this._territories$.next(territories)));
  }

  loadCampaigns(): Observable<Campaign[]> {
    return this.campaignService.load().pipe(tap((campaigns) => this._campaigns$.next(campaigns)));
  }

  public loadAll() {
    return this.authenticationService
      .check()
      .pipe(
        mergeMap((user) =>
          user
            ? forkJoin(
                this.loadOperators(),
                this.loadCampaigns(),
                this.loadTerritories(),
                this.loadCurrentOperator(),
                this.loadCurrentTerritory(),
              )
            : of(null),
        ),
      );
  }
}
